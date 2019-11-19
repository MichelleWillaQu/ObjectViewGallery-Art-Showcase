from model import (User, Media, MediaType, WhichTag, 
                   Tag, Like, Following)
from model import connect_to_db, db
from server import app
from datetime import datetime

def set_acceptable_media_types():
    acceptable_list = [MediaType(media_ext='gif'),
                       MediaType(media_ext='jpg'),
                       MediaType(media_ext='jpeg'),
                       MediaType(media_ext='png'),
                       MediaType(media_ext='obj'),
                       MediaType(media_ext='gltf')]
    db.session.add_all(acceptable_list)
    db.session.commit()

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Run functions
    set_acceptable_media_types()