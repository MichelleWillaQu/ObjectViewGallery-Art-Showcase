import React, {useRef, createContext} from 'react'
import ReactDOM from 'react-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import $ from 'jquery';


// Declares my draggable items
const ItemTypes = {
  TWOD: 'twoD',
  OBJ: 'obj',
  GLTF: 'gltf'
}


class Grid extends React.Component {
  constructor(props){
    super(props);
    //tester: items: [{name: 'Hi', order: 0},
                 // {name: 'Hello', order: 1},
                 // {name: 'Welcome', order: 2},
                 // {name: 'Konichiwa', order: 3}]
    this.state = {isMounted: false,
                  userVerified: false,
                  editMode: false,
                  items: []};
    this.moveMedia = this.moveMedia.bind(this);
    this.editClick = this.editClick.bind(this);
  }

  moveMedia(item, hoveringOverItem){
    this.setState((prevState) => {
      const itemOrder = item.order;
      const hoveringOrder = hoveringOverItem.order;
      const itemAfterHoveringItem = itemOrder > hoveringOrder;
      let changedList = [];
      if (itemAfterHoveringItem){
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
      console.log('SET STATE: ', changedList);
      return {items: changedList};
    });
  }

  componentDidMount(){
    const pageElement = document.querySelector('#element');
    const pageInfo = pageElement.className;
    // console.log(pageInfo);
    // console.log('HI ', pageInfo[0]);
    $.get('/api/check_current_user.json', {username: pageInfo}, (response) => {
      // console.log('RETURN: ', response.data);
      if(response.data){
        this.setState({userVerified: true});
      }
    });
    const data = {username: pageInfo}
    $.get('/api/get-media.json', data, (response) => {
      // console.log('BACK: ', response.background_url);
      console.log('MEDIA: ', response.media);
      const updatedItems = [];
      let dimensions = '';
      for (const item of Object.values(response.media)) {
        if(item.type === 'png' || item.type === 'jpg' || item.type === 'jpeg'){
          dimensions = ItemTypes.TWOD;
        }
        else if (item.type === 'gltf'){
          dimensions = ItemTypes.GLTF;
        }
        else {//TO DO: handle gifs
          dimensions = ItemTypes.OBJ;
        }

        updatedItems.push({name: item.media_name,
                     url: item.media_url,
                     type: dimensions,
                     thumb_url: item.thumb_url,
                     order: item.order});
      }
      console.log('UPDATED: ', updatedItems);
      this.setState({items: updatedItems});
    });
  }

  makeMediaElements(media){
    console.log('MAKING:', this.state.items);
    for (const item of this.state.items){
      if (item.type === ItemTypes.TWOD){
        media.push(<TwoDMedia key={item.name} name={item.name} 
                              order={item.order} url={item.url}
                              onHover={this.moveMedia}
                              editMode={this.state.editMode} />);
      }
      else {
        media.push(<Obj key={item.name} name={item.name} 
                              order={item.order} url={item.url}
                              editMode={this.state.editMode} />);
      }
    }
    return media;
  }

  editClick(){
    //TO DO: if this.state.editMode === true then post to db
    this.setState((prevState) => {
      return {editMode: !prevState.editMode};
    });
  }

  render(){
    const media = this.makeMediaElements([]);
    return(
      <span>
        {this.state.userVerified ? (<div>
                                      <button onClick={this.editClick}>
                                        {this.state.editMode ? 'Save' : 'Edit'}
                                      </button>
                                    </div>) 
                                 : null}
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


// class MediaWrapper extends React.Component {
//   // a row of media
//   render(){
//     // flex is the shorthand for (grow, shrink, and basis) 
//     // box-sizing: border-box specifies to account for border and padding in this
//     // element's width and height
//     return(
//       <div className="wrapper" style={{flex: '0 0 20%',
//                                        display: 'flex',
//                                        justifyContent: 'center',
//                                        alignItems: 'stretch',
//                                        boxSizing: 'border-box'}}>
//       </div>
//     );
//   }
// }


function TwoDMedia(props) {
  const reference = useRef(null);
  const [{isDragging}, drag] = useDrag({
    item: {name: props.name,
           order: props.order, 
           type: ItemTypes.TWOD},
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });
  const [, drop] = useDrop({
    accept: [ItemTypes.TWOD, ItemTypes.OBJ, ItemTypes.GLTF],
    hover(item) {
      if (item.order !== props.order){
        props.onHover(item, props);
      }
      // console.log("Hovering order: ", item.order, " name: ", item.name);
      // console.log("Hovered over item with order: ", props.order);
    }
  });
  //initialize drag and drop on component
  drag(drop(reference))
  // flex-grow will make the div take up that proportion of the wrapper with
  // respect to other media (flexGrow: '1')
  // background-image > img tag to be able to use background-size/position
  return(
    <div name={props.name} style={{backgroundImage: `url(${props.url})`,
                                   backgroundSize: 'cover',
                                   backgroundPosition: '50%',
                                   opacity: isDragging ? '0.5' : '1'}}
         ref={reference} className='mediaElement'>
    </div>
  );
}


function Obj(props) {
  return(
    <div name={props.name} style={{}}
         className='mediaElement'>
      {props.name}
    </div>
  );
}


ReactDOM.render(
  <Grid />,
  document.getElementById('element')
);