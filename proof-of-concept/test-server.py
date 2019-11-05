from random import randint
from flask import Flask, request, jsonify, render_template, redirect, session
#requests and shutil for getting img from url
import requests, shutil
from requests_oauthlib import OAuth2Session

app = Flask(__name__)
app.secret_key = 'ABC'

client_id = 10779 #from registering my app.
#to obtain code
authorization_base_url = 'https://www.deviantart.com/oauth2/authorize'
token_url = 'https://www.deviantart.com/oauth2/token'
client_secret = '88ab4046d51598de373368f085f94412'


@app.route("/")
def show_index():
    """Show 3D test page"""

    return render_template("test-3D.html")


@app.route('/api')
def authorize():
    #oauth object
    deviantart = OAuth2Session(client_id, redirect_uri='https://localhost:5000/callback')
    authorization_url, state = deviantart.authorization_url(authorization_base_url)
    print(f'A_url: {authorization_url}')
    print(f'state: {state}')
    session['oauth_state'] = state
    return redirect(authorization_url) #Works only if logged in...
    #return redirect('http://localhost:5000/callback')


@app.route('/callback')
def callback():
    response = OAuth2Session(client_id, state=session['oauth_state'])
    token = response.fetch_token(token_url, authorization_response=request.url,
                                 client_secret=client_secret)
    print(f'token: {token}')
    print(f'code: {token.code}')
    return 'potato'


@app.route('/image-layout')
def test_redirect_uri():
    return "Hi this sorta works."


@app.route('/potato')
def test():

    return "I guess this fails..."



def get_img(url):
    response = requests.get(url, stream=True)
    with open('img.png', 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response



if __name__ == "__main__":
    #https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https
    app.run(debug=True, host="0.0.0.0", ssl_context='adhoc')
