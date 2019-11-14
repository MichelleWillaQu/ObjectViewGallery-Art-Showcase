import React from 'react'
import ReactDOM from 'react-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

//declares my draggable items
const ItemTypes = {
  TWOD: 'twoD',
  THREED: 'threeD',
}

function TwoDElement(props){
  const [{ isDragging }, drag] = useDrag({
    item: {id: props.id,
           type: ItemTypes.TWOD},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
  return(
    <div ref={drag} style={{width: '300px', height: '300px'}}>
      <img src='../static/uploads/Archer-Class_Alex_800x800_SEPS-1000x1000.jpg' />
    </div>
  );
}

function Square(props){
  const [, drop] = useDrop({
    accept: [ItemTypes.TWOD, ItemTypes.THREED],
    drop: (item) => props.changeState(props.x, props.y, item.id),
  })
  return(<div ref={drop} style={{width: '100%',
                                 height: '100%'}}>
            {props.children}
         </div>);
}

class Grid extends React.Component{
  constructor(props){
    super(props);
    this.state = {'Archer-Class': {x: 0, y: 0, width: '300px', height: '300px',
                                   type: ItemTypes.TWOD},
                  'Monster': {x: 0, y: 0, width: '300px', height: '300px',
                              type: ItemTypes.THREED}};
    this.moveElement = this.moveElement.bind(this);
  }
  moveElement(x, y, mediaName){
    this.setState((prevState) => {
      const changedItem = Object.assign({}, prevState[mediaName])
      changedItem.x = x;
      changedItem.y = y;
      return {changedItem};
    });
  }
  render(){
    const squares = [];
    let item = null;
    for (let i = 0; i < 380; i++) {
      const x = i % 20;
      const y = Math.floor(i / 20); //rounds down
      for (const key of Object.keys(this.state)){
        const media = this.state[key];
        if(media.x === x && media.y === y){
          if(media.type === ItemTypes.TWOD){
            item = (<TwoDElement id={key} />);
          }
          else{
            //
          }
        }
      }
      squares.push(<div key={i} style={{width: '5%', height: '5%'}}>
                      <Square changeState={this.moveElement} 
                              x={x} y={y}>{item}</Square>
                   </div>);
      item = null;
    }
    //enclose the component inside DND context provider with initialized backend
    return (<DndProvider backend={HTML5Backend}>
              <div style={{width: '100vw',
                           height: '95vh',
                           display: 'flex',
                           flexWrap: 'wrap'}}>
                {squares}
              </div>
            </DndProvider>);
  }
}

ReactDOM.render(
  <Grid />,
  document.getElementById('element')
);