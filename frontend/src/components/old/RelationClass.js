import axios from 'axios';  
import React,{Component, useEffect, useState} from 'react'; 
import { 
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap';

export default function RelationClass({classes, nodes, setSelectedRel, selectedRel}) { 
    
    // const [current_classes, setcurrent_classes] = useState(classes);

    function handleSubmit(e){
      setSelectedRel(e.target.value);
    }

    return ( 
      <Container>
        <Row style={{marginLeft:'auto'}}>
          <sub style={{margin: '5px', fontSize: '0.7em'}}>Selected Class: {selectedRel.current}</sub>
        </Row>
        <Row style={{ margin: '5px', height: 'fit-content', backgroundColor: 'lightblue'}}>
          <Col id='classbar' style={{ textAlign: 'center', margin: '3px'}}>
            {classes.map((item) =>
                <Button onClick={handleSubmit} value={item} key={Math.random()} style={{ margin: '10px'}}>{item}</Button>
              )}
          </Col>
        </Row>
      </Container>
      );
  }   