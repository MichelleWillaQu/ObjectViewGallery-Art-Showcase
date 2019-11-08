from flask import (Flask, render_template, redirect, request, flash, session, 
                  jsonify)
from flask_bcrypt import Bcrypt
from functools import wraps
from sqlalchemy import func
from datetime import datetime
from model import connect_to_db, db, User, Media, MediaType, Page

import os
from werkzeug.utils import secure_filename
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined


app = Flask(__name__)

#Bcrypt
bcrypt = Bcrypt(app)

#secure_filename
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails
# silently. This is horrible. Fix this so that, instead, it raises an
# error.
app.jinja_env.undefined = StrictUndefined


#Custom decorators
def must_be_logged_in(func):  #runs when func decorated with this
    #"@wraps is a decorator that does some bookkeeping so that
    #decorated_function() appears as func() for the purposes of documentation
    #and debugging. This makes the behavior of the functions a little more natural."
    @wraps(func)
    #"decorated_function will get all of the args and kwargs
    #that were passed to the original view function func()"
    #check functionality here
    def decorated_function(*args, **kwargs):
        if not session.get('user'):
            flash('You are not logged in.')
            return redirect('/')
        return func(*args, **kwargs)
    return decorated_function

def must_be_logged_out(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if session.get('user'):
            flash('Logout first please!')
            return redirect('/')
        return func(*args, **kwargs)
    return decorated_function


@app.route('/')
def homepage():
    return render_template('homepage.html')


@app.route('/login')
@must_be_logged_out
def login():
    return render_template('login.html') #TO DO: accept username too

@app.route('/login-action', methods=['GET'])
@must_be_logged_out
def login_action():
    #get data from form
    email = request.args.get('email')
    password = request.args.get('password')

    #query to see if user exists
    user = User.query.filter(User.email==email).first()
    if not user:
        flash('That email is not associated with an account.')
        return redirect('/login')

    #check if passwords match
    if not bcrypt.check_password_hash(user.password, password):
        flash('Incorrect email and password combination.')
        return redirect('/login')
    #it matches
    session['user'] = user.user_id
    return redirect('/')


@app.route('/signup')
@must_be_logged_out
def signup():
    return render_template('signup.html') #TO DO: form changes

@app.route('/signup-action', methods=['POST'])
@must_be_logged_out
def signup_action():
    #get data from form
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    bio = request.form.get('bio')

    #query to confirm that username and email do not already exist
    user = User.query.filter(User.username==username).first()
    if user:
        flash('That username is taken.')
        return redirect('/signup')
    user = User.query.filter(User.email==email).first()
    if user:
        flash('That email is already used.')
        return redirect('/signup')

    #add user to database
    new_user = User(username=username,
                    password=bcrypt.generate_password_hash(password),
                    info=bio,
                    email=email)
    new_page = Page(page_num=1,
                    background_url='static/themes/parchment.jpg',
                    user_id=new_user.user_id)
    new_user.pages.append(new_page)
    db.session.add(new_user)
    db.session.commit()

    #log the user in
    session['user'] = new_user.user_id

    return redirect('/')

@app.route('/logout')
@must_be_logged_in
def logout():
    del session['user']
    return redirect('/')


@app.route('/upload')
@must_be_logged_in
def upload():
    return render_template('upload.html') #TO DO: form changes

@app.route('/upload-action', methods=['POST'])
@must_be_logged_in
def upload_action():
    #get data
    name = request.form.get('name')
    info = request.form.get('metadata')
    downloadable = request.form.get('downloadable') == 'true'
    date = request.form.get('creation')  #YYYY-MM-DD

    #To handle media file upload
    file = request.files['media']  #gets the media from form
    # filename = secure_filename(file.filename)
    extension = (file.filename).rsplit('.', 1)[1].lower()
    ext_id = db.session.query(MediaType.media_id).one()[0]
    file_num = db.session.query(func.max(Media.media_id)).first()
    if not file_num[0]:
        filename = '0' + '.' + extension
    else:
        new_num = int(file_num[0]) + 1
        filename = str(new_num) + '.' + extension
    print(f'filename2: {filename}')
    #save the file in the correct directory
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    file_url = 'static/uploads/' + filename

    #setting date if no value, else transforming to correct DateTime
    if date:
        date = datetime.strptime(date, "%Y-%m-%d")
    else:
        date = datetime.today()

    #Add media to database
    # new_media = Media(media_name=name,
    #                   meta_info=info,
    #                   media_url=file_url,
    #                   is_downloadable=downloadable,
    #                   date_created=date,
    #                   react_var_id=
    #                   type_id=ext_id,
    #                   user_id=session['user'],
    #                   page_id=1)

    return redirect('/')


@app.route('/settings')
@must_be_logged_in
def settings():
    return "Hi"


@app.route('/<username>-<page_num>')
def user(username, page_num):
    return "Hello"


@app.route('/<media_name>')
def media(media_name):
    return "Why hello my friend."


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the
    # point that we invoke the DebugToolbarExtension
    app.debug = True
    # make sure templates, etc. are not cached in debug mode
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)
    app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')