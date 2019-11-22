from flask import (Flask, render_template, redirect, request, flash, session, 
                  jsonify)
from flask_bcrypt import Bcrypt
from functools import wraps
from sqlalchemy import func
from datetime import datetime
from model import (connect_to_db, db, User, Media, MediaType, ObjToMTL,
                   WhichTag, Tag, Like, Follow)

import os
from werkzeug.utils import secure_filename
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined


app = Flask(__name__)

# Bcrypt
bcrypt = Bcrypt(app)

# Set the initial upload location
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails
# silently. This is horrible. Fix this so that, instead, it raises an
# error.
app.jinja_env.undefined = StrictUndefined


#Custom decorators
def must_be_logged_in(func):  # Runs when func is decorated with
    # "@wraps is a decorator that does some bookkeeping so that
    # decorated_function() appears as func() for the purposes of documentation
    # and debugging. This makes the behavior of the functions a little more natural."
    @wraps(func)
    # "decorated_function will get all of the args and kwargs
    # that were passed to the original view function func()"
    # Check functionality here
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
def homepage():  #TO DO
    return render_template('homepage.html')


@app.route('/login')
@must_be_logged_out
def login():
    return render_template('login.html') #TO DO: accept username too

@app.route('/login-action', methods=['GET'])
@must_be_logged_out
def login_action(): #TO CHANGE BACK
    # Get data from form
    email = request.args.get('email')
    password = request.args.get('password')

    # Query to see if user exists
    user = User.query.filter(User.email == email).first()
    if not user:
        flash('That email is not associated with an account.')
        return redirect('/login')

    # Check if passwords match
    if not bcrypt.check_password_hash(user.password, password):
        flash('Incorrect email and password combination.')
        return redirect('/login')
    # It matches
    session['user'] = user.user_id
    return redirect('/')


@app.route('/signup')
@must_be_logged_out
def signup():
    return render_template('signup.html') #TO DO: form changes

@app.route('/signup-action', methods=['POST'])
@must_be_logged_out
def signup_action():
    # Get data from form
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    bio = request.form.get('bio')

    # Query to confirm that username and email do not already exist
    user = User.query.filter(User.username == username).first()
    if user:
        flash('That username is taken.')
        return redirect('/signup')
    user = User.query.filter(User.email == email).first()
    if user:
        flash('That email is already used.')
        return redirect('/signup')

    # Make a user directory
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], username)
    os.mkdir(folder_path)

    # Add user to database with a link to their new folder
    new_user = User(username = username,
                    password = bcrypt.generate_password_hash(password),
                    info = bio,
                    email = email,
                    background_url = '/static/themes/parchment.png',
                    folder_url = folder_path)
    db.session.add(new_user)
    db.session.commit()

    # Log the user in
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
    return render_template('upload.html') #TO DO: form validation(names, tags, metadata)

@app.route('/upload-action', methods=['POST'])  #TO DO, CHECK
@must_be_logged_in
def upload_action():
    # The user
    user = User.query.filter_by(user_id = session['user']).one()
    # Get data
    name = request.form.get('name')
    # Format name for urls
    name = "-".join(name.split(' '))

    # Make sure the name is unique
    media = Media.query.filter_by(media_name = name).first()
    if media:
        flash('You already have art with that name!')
        return redirect('/upload')

    # To handle media file upload
    # Boolean for whether the file has an associated mtl
    has_mtl = False
    # Check the type of file first
    type_of_file = request.form.get('type');
    # Make a new directory for media
    new_dir_path = os.path.join(user.folder_url, name)
    os.mkdir(new_dir_path)
    if type_of_file == '2D':
        file = request.files['twoD-media']  # Gets the object from form
        extension = (file.filename).rsplit('.', 1)[1].lower()
        if extension not in ['jpg', 'jpeg', 'png']:
            flash('Not a valid file. Please follow the accepted file types.')
            return redirect('/upload')
        # The media name is unique for the user (using the formatted name)
        filename = name + '.' + extension
        # Save the file in the user's directory
        file_url = os.path.join(new_dir_path, filename)
        file.save(file_url)
    elif type_of_file == 'OBJ':
        file = request.files['obj-media']
        extension = (file.filename).rsplit('.', 1)[1].lower()
        if extension != 'obj':
            flash('Not a valid file. Please follow the accepted file types.')
            return redirect('/upload')
        filename = name + '.' + extension
        file_url = os.path.join(new_dir_path, filename)
        file.save(file_url)
        mtl_file = request.files['obj-mtl']
        if mtl_file:
            mtl_ext = (mtl_file.filename).rsplit('.', 1)[1].lower()
            if mtl_ext != 'mtl':
                    flash(f"Not a valid file. Please follow the accepted " \
                          f"file types.")
                    return redirect('/upload')
            mtl_url = os.path.join(new_dir_path, (mtl_file.filename
                                                          .rsplit('/', 1)[-1]))
            mtl_file.save(mtl_url)
            has_mtl = True
            for texture in request.files.getlist('obj-textures'):
                text_ext = (texture.filename).rsplit('.', 1)[1].lower()
                if text_ext not in ['jpg', 'jpeg', 'png']:
                    flash(f"Not a valid file. Please follow the accepted " \
                          f"file types.")
                    return redirect('/upload')
                #save each texture
                texture.save(os.path.join(new_dir_path, (texture.filename
                                                                .rsplit('/', 1)[-1])))
    else: #if type_of_file == 'GLTF'
        file = request.files['gltf-media']
        extension = (file.filename).rsplit('.', 1)[1].lower()
        if extension != 'gltf':
            flash('Not a valid file. Please follow the accepted file types.')
            return redirect('/upload')
        filename = name + '.' + extension
        gltf_bin = request.files['gltf-bin']
        bin_ext = (gltf_bin.filename).rsplit('.', 1)[1].lower()
        if bin_ext != 'bin':
            flash('Not a valid file. Please follow the accepted file types.')
            return redirect('/upload')
        file_url = os.path.join(new_dir_path, filename)
        file.save(file_url)
        gltf_bin.save(os.path.join(new_dir_path, (gltf_bin.filename
                                                          .rsplit('/', 1)[-1])))

    # Rest of form data
    info = request.form.get('metadata')
    downloadable = request.form.get('downloadable') == 'true'
    date = request.form.get('creation')  #YYYY-MM-DD
    tags = request.form.get('tags')
    thumbnail = request.files['thumbnail']

    # Formatting
    tag_list = tags.split('\n')
    # Setting date if no value, else transforming to correct DateTime
    if date:
        date = datetime.strptime(date, "%Y-%m-%d")
    else:
        date = datetime.today()

    # Handling if no thumbnail input
    if thumbnail:
        thumb_ext = (thumbnail.filename).rsplit('.', 1)[1].lower()
        if thumb_ext not in ['jpg', 'jpeg', 'png']:
            flash(f"Not a valid file. Please follow the accepted " \
                  f"file types.")
            return redirect('/upload') 
        thumbnail_url = os.path.join(new_dir_path,
                                     secure_filename(thumbnail.filename))
        thumbnail.save(thumbnail_url)
    else:
        thumbnail_url = None

    #Add media to database
    ext_obj = MediaType.query.filter_by(media_ext = extension).one()
    new_media = Media(media_name = name,
                      meta_info = info,
                      media_url = ('/' + file_url),
                      is_downloadable = downloadable,
                      date_created = date,
                      type_of = ext_obj,
                      user = user,
                      order = len(user.owned_media),
                      thumb_url = thumbnail_url)
    if has_mtl:
        new_mtl = ObjToMTL(media = new_media, mtl_url = ('/' + mtl_url))
    for tag in tag_list: #TO DO: handle tag validation
        if tag != '':
            tag_existing = Tag.query.filter_by(tag_name = tag.strip()).first()
            if not tag_existing:
                new_media.tags.append(Tag(tag_name = tag.strip()))
            else:
                new_media.tags.append(tag_existing)

    db.session.add(new_media)
    db.session.commit()

    return redirect('/')


@app.route('/settings')  #TO DO: JS
@must_be_logged_in
def settings():
    return render_template('settings.html')

# @app.route('/settings-action') #TO DO: ALL
# @must_be_logged_in
# def settings-action():
#
#      return redirect('/')


@app.route('/gallery/<username>')  #TO DO
def user(username):
    user = User.query.filter_by(username = username).first()
    if not user:
        flash('Invalid url')
        return redirect('/')
    return render_template('gallery.html', user=user, username=user.username)


@app.route('/<username>/<media_name>')  #TO DO, CHECK
def media(username, media_name):
    """ Individual Media Page """
    user = User.query.filter_by(username = username).first()
    if not user:
        flash('Invalid url')
        return redirect('/')
    media = (Media.query.filter(Media.user_id == user.user_id,
                               Media.media_name == media_name)
                        .first())
    if not media:
        flash('Invalid url')
        return redirect('/')
    formatted_name = ' '.join(media.media_name.split('-'))
    if media.type_of.media_ext == 'obj':
        if media.mtl:
            js_status = 'obj+mtl'
        else:
            js_status = 'obj'
    elif media.type_of.media_ext == 'gltf':
        js_status = 'gltf'
    else:
        js_status = None 
    return render_template('mediapage.html',
                            media=media,
                            formatted_name=formatted_name,
                            status=js_status)

############################################################

@app.route('/api/gallery-settings-check.json', methods=['GET'])
def check_current_user():
    username = request.args.get('username')
    if not session.get('user'):
        return jsonify({'loggedin': False})
    gallery_user = User.query.filter_by(username = username).first()
    if session['user'] == gallery_user.user_id:
        following = False
        verified = True
    else:
        verified = False
        follow = (Follow.query.filter(Follow.user_followed_id == gallery_user.user_id,
                                     Follow.follower_id == session['user'])
                             .first())
        if not follow:
            following = False
        else:
            following = True
    return jsonify({'loggedin': True,
                    'verified': verified,
                    'following': following})

@app.route('/api/follow-changes', methods=['POST'])
@must_be_logged_in
def follow_changes():
    data =  request.get_json()
    gallery_user = User.query.filter_by(username = data['postData'][1]).first()
    # Short-circuit check for errors
    if not gallery_user or (session['user'] == gallery_user.user_id):
        return jsonify("ERROR")
    if data['postData'][0]:  # If the user is following
        follow = (Follow.query.filter(Follow.user_followed_id == gallery_user.user_id,
                                     Follow.follower_id == session['user'])
                              .first())
        if not follow:
            return jsonify("ERROR")
        db.session.delete(follow)
        message = "FOLLOWED"
    else:  # If the user is not following
        user = User.query.filter_by(user_id = session['user']).first()
        user.following.append(Follow(user_followed = gallery_user))
        message = "UNFOLLOWED"
    db.session.commit()
    return jsonify(message)


@app.route('/api/get-media.json', methods=['GET'])
def get_media():
    username = request.args.get('username')
    user = User.query.filter_by(username = username).first()
    media_lst = []
    # .sort(key=(lambda x: x.order)) #CHECK
    for media in user.owned_media:
        media_lst.append({'media_id': media.media_id,
                          'media_name': media.media_name,
                          'media_url': media.media_url,
                          'thumb_url': media.thumb_url,
                          'type': media.type_of.media_ext,
                          'order': media.order})
    return jsonify({'media': media_lst})

@app.route('/api/post-media-changes', methods=['POST'])
@must_be_logged_in
def post_media_changes():
    # TO DO: PASS USERNAME TOO
    data =  request.get_json()
    for media in data['postData']:
        entry = Media.query.filter_by(media_id = media['id']).first()
        if not entry:
            return jsonify("ERROR")
        entry.order = media['order']
    db.session.commit()
    return jsonify("CONFIRMED")


# @app.route('/api/get-kudos.json', methods=['GET'])
# @must_be_logged_in
# def get_kudos():
#     return ''

# @app.route('/api/post-kudos.json', methods=['POST])
# @must_be_logged_in
# def post_kudos():
#     return ''


@app.route('/api/upload-name-check.json', methods=['GET'])
@must_be_logged_in
def upload_name_check():
    name_to_check = request.args.get('checkName')
    user = User.query.filter_by(user_id = session['user']).first()
    entry = Media.query.filter_by(media_name = name_to_check).first()
    if entry:  # If there is already an entry with the same name
        return False
    return True


# @app.route('/api/signup-check.json', methods=['GET'])
# @must_be_logged_out
# def signup_check():
#     return ''


@app.route('/api/change-media-data', methods=['POST'])
@must_be_logged_in
def change_media_data():
    media_id = request.form.get('mediaId')
    media = Media.query.filter_by(media_id = media_id).first()
    user = User.query.filter_by(user_id = session['user']).first()
    if media.user != user:  # If there is already an entry with the same name
        return jsonify("ERROR")
    # Get the rest of the data
    description = request.form.get('meta-change')
    tags = request.form.get('tags-change')
    is_downloadable = request.form.get('downloadable-change')
    date = request.form.get('date-change')  #TO DO: PASS NONE if no change
    thumbnail = request.files['thumb-change'] #TO DO: HANDLE
    name = request.form.get('name-change') #TO DO: HANDLE via upload-name-check
    # HANDLE CHANGES
    return jsonify("CONFIRMED")


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