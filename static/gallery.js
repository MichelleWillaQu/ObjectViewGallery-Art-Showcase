import React, {useRef, createContext} from 'react'
import ReactDOM from 'react-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import $ from "jquery";


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
                  editMode: false,
                  items: [{name: 'Hi', order: 0},
                          {name: 'Hello', order: 1},
                          {name: 'Welcome', order: 2},
                          {name: 'Konichiwa', order: 3}]};
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
      else{
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

  }

  makeMediaElements(media){
    for (const item of this.state.items){
      media.push(<TwoDMedia key={item.name} name={item.name} 
                            order={item.order} onHover={this.moveMedia}
                            editMode={this.state.editMode} />);
    }
    return media;
  }

  editClick(){
    this.setState((prevState) => {
      return {editMode: !prevState.editMode};
    });
  }

  render(){
    const media = this.makeMediaElements([]);
    return(
      <span>
        <div>
          <button onClick={this.editClick}>
            {this.state.editMode ? 'Save' : 'Edit'}
          </button>
        </div>
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
  // respect to other media
  // background-image > img tag to be able to use background-size/position
  return(
    <div name={props.name} style={{border: '1px solid transparent',
                                   flexGrow: '1',
                                   display: 'flex',
                                   justifyContent: 'center',
                                   alignItems: 'center',
                                   backgroundImage: `url(${props.url})`,
                                   backgroundSize: 'cover',
                                   bacgroundPosition: '50%',
                                   opacity: isDragging ? '0.5' : '1'}}
             ref={reference}>{props.name}
    </div>
  );
}

ReactDOM.render(
  <Grid />,
  document.getElementById('element')
);