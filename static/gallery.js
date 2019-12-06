import React, {useRef, useEffect} from 'react'
import ReactDOM from 'react-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import $ from 'jquery';
import {threejsEntry} from './three-main';


// Declares my draggable items
const ItemTypes = {
  TWOD: 'twoD',
  OBJ: 'obj',
  GLTF: 'gltf'
}


// The big container class that holds everything and maintains the truth
class Grid extends React.Component {
  constructor(props){
    super(props);
    // The first 5 state keys are for the functionality of the page (what kind
    // of buttons are present) then items holds the truth for the location of
    // media while threeItems and threeActive affects the three.js functionality
    // (threeItems is the list of 3D items passed to three.js code)
    this.state = {username: "",
                  userVerified: false,
                  editMode: false,
                  loggedin: false,
                  following: false,
                  items: [],
                  threeItems: [],
                  threeActive: false};
    this.moveMedia = this.moveMedia.bind(this);
    this.editClick = this.editClick.bind(this);
    this.followClick = this.followClick.bind(this);
  }

  // The logic for changing the position of items when something is dragged and
  // dropped
  moveMedia(item, hoveringOverItem){
    this.setState((prevState) => {
      const itemOrder = item.order;
      const hoveringOrder = hoveringOverItem.order;
      const itemAfterHoveringItemBool = itemOrder > hoveringOrder;
      let changedList = [];
      if (itemAfterHoveringItemBool){
        // The item is moved to an earlier position and everything else is moved
        // back
        const itemsBefore = prevState.items.slice(0, hoveringOrder);
        const toChange = prevState.items.slice(hoveringOrder, itemOrder);
        // Empty if > len
        const itemsAfter = prevState.items.slice(itemOrder + 1);
        changedList = [].concat(itemsBefore);
        item.order = hoveringOrder;
        changedList.push(item);
        for (const otherMedia of toChange){
          otherMedia.order += 1;
          changedList.push(otherMedia);
        }
        changedList = changedList.concat(itemsAfter);
      }
      else {
        // The item is moved to a later position and move everything forward
        const itemsBefore = prevState.items.slice(0, itemOrder);
        const toChange = prevState.items.slice(itemOrder + 1, hoveringOrder + 1);
        // Empty if > len
        const itemsAfter = prevState.items.slice(hoveringOrder + 1);
        changedList = [].concat(itemsBefore);
        for (const otherMedia of toChange){
          otherMedia.order -= 1;
          changedList.push(otherMedia);
        }
        item.order = hoveringOrder;
        changedList.push(item);
        changedList = changedList.concat(itemsAfter);
      }
      return {items: changedList};
    });
  }

  // The edit button will only show if this is the current user's gallery
  editClick(){
    const currentState = this.state.editMode;
    // If currently in Edit Mode - post the changes before reverting back to view
    // mode
    if (currentState){
      const data = {username: this.state.username,
                    postData: this.state.items};
      $.ajax({
        url: '/api/post-media-changes',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: (response) => {
          if (response === "CONFIRMED"){
            alert('Changes saved!');
          }
          else {
            alert('Could not save changes. Please try again later.');
          }
        }
      });
    }

    // Always executes
    this.setState((prevState) => {
      return {editMode: !prevState.editMode};
    });
  }

  // The follow button will only show if there is a user logged in and this is
  // not their gallery
  followClick(){
    const data = {postData: [this.state.following, this.state.username]}
    $.ajax({
      url: '/api/follow-changes',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (response) => {
        if (response === "FOLLOWED"){
          alert('You are now a follower!');
        }
        else if (response === "UNFOLLOWED"){
          alert(`You have unfollowed ${this.state.username}.`)
        }
        else {
          alert('Could not follow. Please try again later.');
        }
      }
    });
    this.setState((prevState) => {
      return {following: !prevState.following};
    });
  }

  // This is where the data is fetched for the gallery page and processed
  componentDidMount(){
    const pageElement = document.querySelector('#element');
    const username = pageElement.className;
    this.setState({username: username});
    $.get('/api/gallery-settings-check.json', {username: username}, (response) => {
      if(response.loggedin){
        this.setState({userVerified: response.verified,
                       loggedin: true,
                       following: response.following});
      }
    });
    $.get('/api/get-media.json', {username: username}, (response) => {
      const updatedItems = [];
      const newThreeItems = [];
      let dimensions = '';
      let url = '';
      // Division of media types into the corresponding kind of React components
      for (const item of response.media) {
        if(item.type === 'png' || item.type === 'jpg' || item.type === 'jpeg' ||
           item.type === 'webp' || item.type === 'gif'){
          dimensions = ItemTypes.TWOD;
          if (item.thumb_url){
            url = item.thumb_url;
          }
          else {
            url = item.media_url;
          }
        }
        else if (item.type === 'gltf'){
          if (item.thumb_url){
            dimensions = ItemTypes.TWOD;
            url = item.thumb_url;
          }
          else {
            dimensions = ItemTypes.GLTF;
            url = item.media_url;
            newThreeItems.push({name: item.media_name,
                                url: url,
                                type: dimensions});
          }
        }
        else {  //OBJ
          if (item.thumb_url){
            dimensions = ItemTypes.TWOD;
            url = item.thumb_url;
          }
          else {
            dimensions = ItemTypes.OBJ;
            url = item.media_url;
            newThreeItems.push({name: item.media_name,
                                url: url,
                                type: dimensions});
          }
        }

        updatedItems.push({id: item.media_id,
                           name: item.media_name,
                           url: url,
                           type: dimensions,
                           order: item.order});
      }
      this.setState({items: updatedItems,
                     threeItems: newThreeItems});
    });
  }

  componentDidUpdate(){
    // Length is not zero
    if (!this.state.threeActive && this.state.threeItems.length){
      threejsEntry(this.state.threeItems);
      // Only want three.js to start one render loop - not one everytime the
      // component updates
      this.setState({threeActive: true});
    }
  }

  // Generates the components for each item in the state and compiles it into
  // one big list for rendering in render()
  makeMediaElements(){
    const media = [];
    for (const item of this.state.items){
      if (item.type === ItemTypes.TWOD){
        media.push(<TwoDMedia key={item.name} id={item.id} name={item.name}
                              order={item.order} url={item.url}
                              onHover={this.moveMedia}
                              username={this.state.username}
                              editMode={this.state.editMode} />);
      }
      else if (item.type === ItemTypes.OBJ){
        media.push(<Obj key={item.name} id={item.id} name={item.name} 
                        order={item.order} url={item.url}
                        onHover={this.moveMedia}
                        username={this.state.username}
                        editMode={this.state.editMode} />);
      }
      else { // GLTF
        media.push(<GLTF key={item.name} id={item.id} name={item.name} 
                         order={item.order} url={item.url}
                         onHover={this.moveMedia}
                         username={this.state.username}
                         editMode={this.state.editMode} />);
      }
    }
    return media;
  }

  loggedInButtons(){
    const inside = [];
    if (!this.state.loggedin){
      return null;
    }

    if (this.state.userVerified){
      inside.push(<button class="my-button ml-auto" onClick={this.editClick}>
                    {this.state.editMode ? 'Save' : 'Edit'}
                  </button>);
    }
    else {
      inside.push(<button class="my-button ml-auto" onClick={this.followClick}>
                    {this.state.following ? 'Unfollow' : 'Follow'}
                  </button>);
    }

    return inside;
  }

  render(){
    const media = this.makeMediaElements();
    const loggedIn = this.loggedInButtons();
    return(
      <span>
      {this.state.loggedin ?
        (<nav class="navbar navbar-expand-sm navbar-light d-flex">
            <a class="navbar-brand" href="/">
              <img class="home-icon" src="/static/my_flavicon.ico" />Home</a>
            {loggedIn}
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <div class="navbar-nav">
                <a class="nav-item ml-auto" href={"/gallery/" + this.state.username}>Gallery</a>
                <a class="nav-item nav-link ml-auto" href="/upload">Upload</a>
                <a class="nav-item nav-link ml-auto" href="/settings">Settings</a>
                <a class="nav-item nav-link ml-auto" href="/logout">Logout</a>
              </div>
            </div>
          </nav>)
        : (<nav class="navbar navbar-expand-sm navbar-light d-flex">
            <a class="navbar-brand" href="/">
              <img class="home-icon" src="/static/my_flavicon.ico" />Home</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <div class="navbar-nav ml-auto">
                <a class="nav-item nav-link ml-auto" href="/login">Log In</a>
                <a class="nav-item nav-link ml-auto" href="/signup">Sign Up</a>
              </div>
            </div>
            </nav>)}
        <DndProvider backend={HTML5Backend}>
          <div id='Grid' style={{width: '100%',
                                 display: 'flex',
                                 flexWrap: 'wrap',
                                 justifyContent: 'flex-start'}}>
            {media}
          </div>
        </DndProvider>
      </span>);
  }
}


// In view mode, the components will have a link to their individual media page
// and in edit mode, they will be draggable
function TwoDMedia(props) {
  // A mutable ref object that is initialized to null and will persist for the
  // entire lifetime of the component
  const reference = useRef(null);

  const [{isDragging}, drag] = useDrag({
    item: {id: props.id,
           name: props.name,
           order: props.order, 
           type: ItemTypes.TWOD,
           url: props.url},
    canDrag: () => props.editMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.TWOD, ItemTypes.OBJ, ItemTypes.GLTF],
    canDrop: () => props.editMode,
    hover(item) {
      if (item.order !== props.order){
        props.onHover(item, props);
      }
    }
  });
  // Initialize drag and drop reference component
  drag(drop(reference))
  // Background-image over img tag to be able to use background-size/position
  const imageElement = (
    <div name={props.name} className='media' 
         style={{backgroundImage: `url(${props.url})`,
                 backgroundSize: 'cover',
                 backgroundPosition: '50%'}}>
    </div>);
  return(
    <span style={{opacity: isDragging ? '0.5' : '1'}}
          ref={reference} className='mediaElement'>
      {props.editMode ? (<span style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </span>)
                      : (<a href={`/${props.username}/${props.name}`}
                          style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </a>)}
    </span>
  );
}


function Obj(props) {
  const reference = useRef(null);

  const [{isDragging}, drag] = useDrag({
    item: {id: props.id,
           name: props.name,
           order: props.order, 
           type: ItemTypes.OBJ,
           url: props.url},
    canDrag: () => props.editMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.TWOD, ItemTypes.OBJ, ItemTypes.GLTF],
    canDrop: () => props.editMode,
    hover(item) {
      if (item.order !== props.order){
        props.onHover(item, props);
      }
    }
  });

  drag(drop(reference))

  const imageElement = (
    <div name={props.name} id={props.name} className='media'
         style={{height: '100%', width: '100%'}}>
    </div>);

  return(
    <span className='mediaElement' ref={reference}>
      {props.editMode ? (<span style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </span>)
                      : (<a href={`/${props.username}/${props.name}`}
                          style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </a>)}
    </span>
  );
}


function GLTF(props){
  const reference = useRef(null);

  const [{isDragging}, drag] = useDrag({
    item: {id: props.id,
           name: props.name,
           order: props.order, 
           type: ItemTypes.GLTF,
           url: props.url},
    canDrag: () => props.editMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.TWOD, ItemTypes.OBJ, ItemTypes.GLTF],
    canDrop: () => props.editMode,
    hover(item) {
      if (item.order !== props.order){
        props.onHover(item, props);
      }
    }
  });

  drag(drop(reference))

  const imageElement = (
    <div name={props.name} id={props.name} className='media'
         style={{height: '100%', width: '100%'}}>
    </div>);

  return(
    <span className='mediaElement' ref={reference}>
      {props.editMode ? (<span style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </span>)
                      : (<a href={`/${props.username}/${props.name}`}
                          style={{height: '100%', width: '100%'}}>
                           {imageElement}
                         </a>)}
    </span>
  );
}


ReactDOM.render(
  <Grid />,
  document.getElementById('element')
);