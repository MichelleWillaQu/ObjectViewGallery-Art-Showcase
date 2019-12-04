from unittest import TestCase
from server import app
from model import (db, connect_to_db, User, Media, MediaType, ObjToMTL,
                   WhichTag, Tag, Like, Follow)
from seed import set_acceptable_media_types
from datetime import datetime
from flask_bcrypt import Bcrypt
from selenium import webdriver
from flask import json, jsonify

bcrypt = Bcrypt(app)

def create_data():
    """Creating the test data."""

    # If this is run more than once, it will empty out existing data in these tables
    User.query.delete()
    Media.query.delete()

    # Generate test data
    carrot = User(username = 'Carrot',
                  password = bcrypt.generate_password_hash('bugsbunny'),
                  info = 'I am a carrot',
                  email = 'carrot@gmail.com',
                  background_url = '/static/themes/parchment.png',
                  folder_url = 'static/Testing/testfiles/Carrot')
    potato = User(username = 'Potato',
                  password = bcrypt.generate_password_hash('frenchfries'),
                  info = 'Hi',
                  email = 'potato@gmail.com',
                  background_url = '/static/themes/parchment.png',
                  folder_url = 'static/Testing/testfiles/Potato')
    tomato = User(username = 'Tomato',
                  password = bcrypt.generate_password_hash('ketchup000'),
                  info = 'Cheers!',
                  email = 'tomato@domain',
                  background_url = '/static/themes/parchment.png',
                  folder_url = 'static/Testing/testfiles/Tomato')
    ext_obj = MediaType.query.filter_by(media_ext = 'jpg').one()
    smiley = Media(media_name = 'smiley',
                   meta_info = 'I smile a lot',
                   media_url = 'static/Testing/testfiles/Carrot/smiley',
                   is_downloadable = True,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = carrot,
                   order = 0)
    crossed = Media(media_name = 'crossed-blob',
                   meta_info = 'No comment',
                   media_url = 'static/Testing/testfiles/Potato/crossed-blob',
                   is_downloadable = False,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = potato,
                   order = 0)
    curious = Media(media_name = 'curious-blob',
                   meta_info = 'HMMM',
                   media_url = 'static/Testing/testfiles/Potato/curious-blob',
                   is_downloadable = False,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = potato,
                   order = 1)
    frown = Media(media_name = 'frowning-blob',
                   meta_info = '',
                   media_url = 'static/Testing/testfiles/Potato/frowning-blob',
                   is_downloadable = False,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = potato,
                   order = 2)
    hand = Media(media_name = 'Hand',
                   meta_info = 'Hi',
                   media_url = 'static/Testing/testfiles/Potato/Hand',
                   is_downloadable = False,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = tomato,
                   order = 0)
    wink = Media(media_name = 'Winky-blob',
                   meta_info = 'wink',
                   media_url = 'static/Testing/testfiles/Potato/Winky-blob',
                   is_downloadable = False,
                   date_created = datetime.today(),
                   type_of = ext_obj,
                   user = tomato,
                   order = 1)

    db.session.add_all([carrot, potato, tomato])
    db.session.commit()


class FlaskTestsDatabase(TestCase):
    """Mock up of posting media"""

    def setUp(self):
        """Done before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        app.config['TESTING'] = True

        app.config['SECRET_KEY'] = 'testingSecrets'
        with self.client as c:
            with c.session_transaction() as sess:
                sess['user'] = 2

        # Connect to test database
        connect_to_db(app, "postgresql:///testdb")
        UPLOAD_FOLDER = 'static/Testing/testfiles'
        app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
        db.create_all()
        set_acceptable_media_types()
        create_data()


    def tearDown(self):
        """Done after every test."""
        db.session.remove()
        db.drop_all()
        db.engine.dispose()

    def test_get_media(self):
        """Test the return for the gallery page."""
        expectedData = [{'media_id': 2,
                         'media_name': 'crossed-blob',
                         'media_url': 'static/Testing/testfiles/Potato/crossed-blob',
                         'thumb_url': None,
                         'type': 'jpg',
                         'order': 0,
                        },
                        {'media_id': 3,
                         'media_name': 'curious-blob',
                         'media_url': 'static/Testing/testfiles/Potato/curious-blob',
                         'thumb_url': None,
                         'type': 'jpg',
                         'order': 1,
                        },
                        {'media_id': 4,
                         'media_name': 'frowning-blob',
                         'media_url': 'static/Testing/testfiles/Potato/frowning-blob',
                         'thumb_url': None,
                         'type': 'jpg',
                         'order': 2,
                        }]
        with self.client as c:
            result = c.get('/api/get-media.json',
                            query_string={'username': 'Potato'},
                            content_type='application/json',
                            follow_redirects=True)
            data = json.loads(result.data)
            self.assertEqual(data['media'], expectedData)

    def test_post_media_changes(self):
        """Test the post to the database via this route."""
        postData = {'postData': [{'id': 3,
                                 'name': 'curious-blob',
                                 'url': 'static/Testing/testfiles/Potato/curious-blob',
                                 'type': 'twoD',
                                 'order': 0},
                                {'id': 4,
                                 'name': 'frowning-blob',
                                 'url': 'static/Testing/testfiles/Potato/frowning-blob',
                                 'type': 'twoD',
                                 'order': 1},
                                {'id': 2,
                                 'name': 'crossed-blob',
                                 'url': 'static/Testing/testfiles/Potato/crossed-blob',
                                 'type': 'twoD',
                                 'order': 2}
                                ],
                    'username': 'Potato'}

        postData = json.dumps(postData)

        resp = self.client.post('/api/post-media-changes',
                   data=postData,
                   content_type='application/json',
                   follow_redirects=True)

        self.assertEqual('CONFIRMED', json.loads(resp.data))

        curious = Media.query.filter_by(media_id=3).one()
        self.assertEqual(curious.order, 0)

        frown = Media.query.filter_by(media_id=4).one()
        self.assertEqual(frown.order, 1)

        crossed = Media.query.filter_by(media_id=2).one()
        self.assertEqual(crossed.order, 2)


class FlaskTestsLoggedin(TestCase):
    """Test pages with a user logged in to session."""

    def setUp(self):
        """Start up"""

        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'testingSecrets'
        self.client = app.test_client()

        with self.client as c:
            with c.session_transaction() as sess:
                sess['user'] = 1

        connect_to_db(app, "postgresql:///testdb")
        db.create_all()
        set_acceptable_media_types()
        create_data()

    def tearDown(self):
        """Done after every test."""
        db.session.remove()
        db.drop_all()
        db.engine.dispose()

    def test_login(self):
        """Test login page."""

        result = self.client.get("/login", follow_redirects=True)
        # Refers to a button
        self.assertIn(b"Gallery", result.data)

    def test_signup(self):
        """Test signup page."""

        result = self.client.get("/signup", follow_redirects=True)
        # Refers to a button
        self.assertIn(b"Gallery", result.data)

    def test_logout(self):
        """Test logout page."""
    
        result = self.client.get("/logout", follow_redirects=True)
        # This refers to a button that will be only present when there is no
        # user in the session
        with self.client as c:
            with c.session_transaction() as sess:
                self.assertNotIn(b'user', sess)
        self.assertIn(b"Log In", result.data)

    def test_upload(self):
        """Test upload page."""

        result = self.client.get("/upload", follow_redirects=True)
        self.assertIn(b"Uploading Media", result.data)


class FlaskTestsLoggedout(TestCase):
    """Test pages without a user."""
    
    def setUp(self):
        """Start up."""

        app.config['TESTING'] = True
        self.client = app.test_client()
        connect_to_db(app, "postgresql:///testdb")
        db.create_all()
        set_acceptable_media_types()

    def tearDown(self):
        """Done after every test."""
        db.session.remove()
        db.drop_all()
        db.engine.dispose()

    def test_login(self):
        """Test login page."""

        result = self.client.get("/login", follow_redirects=True)
        # Refers to a button
        self.assertIn(b"Please Login", result.data)

    def test_signup(self):
        """Test signup page."""

        result = self.client.get("/signup", follow_redirects=True)
        # Refers to a button
        self.assertIn(b"Please Signup", result.data)

    def test_logout(self):
        """Test logout page."""

        result = self.client.get("/logout", follow_redirects=True)
        # This refers to a button
        self.assertIn(b"Log In", result.data)

    def test_upload(self):
        """Test upload page."""

        result = self.client.get("/upload", follow_redirects=True)
        # Refers to a button only present if logged out
        self.assertIn(b"Log In", result.data)

if __name__ == "__main__":
    import unittest
    unittest.main()
