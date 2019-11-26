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


class Grid extends React.Component {
  constructor(props){
    super(props);
    this.state = {isMounted: false,
                  username: "",
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

  moveMedia(item, hoveringOverItem){
    this.setState((prevState) => {
      const itemOrder = item.order;
      const hoveringOrder = hoveringOverItem.order;
      const itemAfterHoveringItemBool = itemOrder > hoveringOrder;
      let changedList = [];
      if (itemAfterHoveringItemBool){
        // The item is moved to an earlier position and everything else is moved back
        const itemsBefore = prevState.items.slice(0, hoveringOrder);
        const toChange = prevState.items.slice(hoveringOrder, itemOrder);
        const itemsAfter = prevState.items.slice(itemOrder + 1);  // empty if > len
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
        const itemsAfter = prevState.items.slice(hoveringOrder + 1);  // empty if > len
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

  editClick(){
    const currentState = this.state.editMode;
    if (currentState){  // If currently in Edit Mode
      const data = {postData: this.state.items};
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
        else {  //OBJ     //TO DO: handle gifs
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
    if (!this.state.threeActive && this.state.threeItems.length){
      // Length is not zero
      threejsEntry(this.state.threeItems);
      // Only want three.js to start one render loop
      this.setState({threeActive: true});
    }
  }

  makeMediaElements(media){
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

  render(){
    const media = this.makeMediaElements([]);
    return(
      <span>
        {this.state.userVerified ? (<button onClick={this.editClick}>
                                      {this.state.editMode ? 'Save' : 'Edit'}
                                    </button>)
                                 : null}
        {(!this.state.userVerified && this.state.loggedin) ?
            (<button onClick={this.followClick}>
               {this.state.following ? 'Unfollow' : 'Follow'}
             </button>)
          : null
        }
        <DndProvider backend={HTML5Backend}>
          <div id='Grid' style={{width: '100vw',
                                 display: 'flex',
                                 flexWrap: 'wrap',
                                 justifyContent: 'flex-start'}}>
            {media}
          </div>
        </DndProvider>
      </span>);
  }
}


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
  // Background-image > img tag to be able to use background-size/position
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