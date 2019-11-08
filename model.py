from flask_sqlalchemy import SQLAlchemy


#Connect to the psql db via Flask-SQLAlchemy library
db = SQLAlchemy() 


#Data Model Definitions
class User(db.Model):
    """User of showcase website."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    #Ref for max string size: https://www.lifewire.com/is-email-address-length-limited-1171110
    username = db.Column(db.String(64))
    password = db.Column(db.Binary(60))
    info = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(254))
    da_name = db.Column(db.String(64), nullable=True)  #Deviantart account name
    last_da_retrieval = db.Column(db.DateTime, nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)


    def __repr__(self):
        """Provide information of the User object."""
        return (f"<User id: {self.user_id} username: {self.username} " \
                f"email: {self.email}>")


class Media(db.Model):
    """Media (different forms of art) users uploaded."""

    __tablename__ = 'media'

    media_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    media_name = db.Column(db.String(100))
    meta_info = db.Column(db.Text, nullable=True)
    media_url = db.Column(db.Text)
    is_downloadable = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.DateTime)
    thumb_url = db.Column(db.Text, nullable=True)
    react_var_id = db.Column(db.Integer, db.ForeignKey('reactvar.react_var_id'))
    type_id = db.Column(db.Integer, db.ForeignKey('mediatypes.type_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    page_id = db.Column(db.Integer, db.ForeignKey('userpages.page_id'))

    #Relationships
    user = db.relationship('User', backref=db.backref('owned_media'))
    type_of = db.relationship('MediaType', backref=db.backref('all_media'))
    page = db.relationship('Page', backref=db.backref('media_on'))
    variables = db.relationship('ReactVar', backref=db.backref('which_media'))

    def __repr__(self):
        """Provide information of the Media object."""
        return (f"<Media id: {self.media_id} name: {self.media_name} " \
                f"user: {self.user_id}>")


class Page(db.Model):
    """A page in a user's gallery."""

    __tablename__ = 'userpages'

    page_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    page_num = db.Column(db.Integer)  #which page in the user's gallery?
    background_url = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    #Relationship
    user = db.relationship('User', backref=db.backref('pages'))

    def __repr__(self):
        """Provide information of the Page object."""
        return (f"<Page id: {self.page_id} num: {self.page_num} " \
                f"user: {self.user_id}>")


class ReactVar(db.Model):
    """Variables for the persistance of elements in React"""

    __tablename__ = 'reactvar'

    react_var_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    #TO BE EDITED

    def __repr__(self):
        """Provide information of the ReactVar object."""
        return (f"<ReactVar" \
                f">")


class MediaType(db.Model):
    """A type of media."""

    __tablename__ = 'mediatypes'

    type_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    media_ext = db.Column(db.String(5), unique=True)

    def __repr__(self):
        """Provide information of the MediaType object."""
        return (f"<MediaType id: {self.type_id} ext: {self.media_ext}>")


class WhichTag(db.Model):
    """Associative table for tags to media."""

    __tablename__ = 'whichtags'

    wt_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    media_id = db.Column(db.Integer, db.ForeignKey('media.media_id'))
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'))

    def __repr__(self):
        """Provide information of the WhichTag object."""
        return (f"<WhichTag id: {self.wt_id} media_id: {self.media_ext} " \
                f"tag_id: {self.tag_id}>")


class Tag(db.Model):
    """A tag is used to categorize media into different genres, thoughts, etc."""

    __tablename__ = 'tags'

    tag_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    tag_name = db.Column(db.String(64), unique=True)

    #Relationship
    all_media = db.relationship('Media', 
                                secondary='whichtags', 
                                backref=db.backref('tags'))

    def __repr__(self):
        """Provide information of the Tag object."""
        return (f"<Tag id: {self.tag_id} name: {self.tag_name}>")


class Like(db.Model):
    """A like stores information on which Media has been liked and by which User."""

    __tablename__ = 'likes'

    like_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    media_id = db.Column(db.Integer, db.ForeignKey('media.media_id'))
    user_who_liked = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    #Relationships
    user = db.relationship('User', backref=db.backref('likes'))
    media = db.relationship('Media', backref=db.backref('likes'))

    def __repr__(self):
        """Provide information of the Like object."""
        return (f"<Like id: {self.likes_id} media_id: {self.media_id} " \
                f"user_id: {self.user_id}>")


class Following(db.Model):
    """A following stores information on which users have liked a certain user."""

    __tablename__ = 'following'

    f_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_followed_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    follower_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    #Relationship
    user_followed = db.relationship('User',
                                    foreign_keys=[user_followed_id],
                                    backref=db.backref('followers'))
    follower = db.relationship('User',
                               foreign_keys=[follower_id], 
                               backref=db.backref('following'))

    def __repr__(self):
        """Provide information of the Following object."""
        return (f"<Following id: {self.likes_id} " \
                f"user_followed: {self.user_id_followed} " \
                f"follower_id: {self.follower_id}>")


#Helper Functions
def connect_to_db(app):
    """Connect the database to the Flask app."""

    # Configure to use our PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///showcase'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    #Interactive mode
    from server import app
    connect_to_db(app)
    print("Connected to showcase database.")