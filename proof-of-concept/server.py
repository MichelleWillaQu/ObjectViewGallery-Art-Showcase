from random import randint
from flask import Flask, request, jsonify, render_template, redirect
import requests, shutil
#requests and shutil for getting img from url

app = Flask(__name__)

@app.route("/")
def show_index():
    """Show test page"""

    return render_template("test-3D.html")

@app.route('/api')
def authorize():
    response = requests.get('https://www.deviantart.com/oauth2/authorize', 
                            headers={'User-Agent': 'Test2'},
                            params={'response_type': 'code',
                                    'client_id': 10778,
                                    'redirect_uri': 'http://localhost:5000/hi'})
    raise 'WTF'


@app.route('/hi')
def test_redirect_uri(response):
    print(response.code)
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
    app.run(debug=True, host="0.0.0.0")
