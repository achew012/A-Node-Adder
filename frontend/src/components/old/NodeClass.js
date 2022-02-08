import axios from 'axios';  
import React,{Component, useEffect, useState} from 'react'; 
import { 
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap';

export default function NodeClass({classes, nodes, setSelectedClass, selectedClass}) { 
    
    //const [current_classes, setcurrent_classes] = useState(classes);    

    function handleSubmit(e){
      e.preventDefault();
      setSelectedClass(e.target.value);
    }


    return (
      <Container>
        <Row style={{marginLeft: 'auto'}}>
          <sub style={{margin: '5px', fontSize: '0.7em'}}>Selected Class: {selectedClass.current}</sub>
        </Row>
        <Row style={{ margin: '5px', height: 'fit-content', backgroundColor: 'lightblue'}}>
          <Col id='classbar' style={{ textAlign: 'center'}}>
            {classes.map((item) =>
                <Button onClick={handleSubmit} value={item} key={Math.random()} style={{ margin: '10px'}}>{item}</Button>
              )}
          </Col>
        </Row>
      </Container> 
      );
  }   