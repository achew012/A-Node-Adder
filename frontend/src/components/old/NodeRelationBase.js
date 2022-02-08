import axios from 'axios';  
import React, {Component, useEffect, useState, useRef} from 'react'; 

import { 
  Container,
  Col,
  Row,
} from 'react-bootstrap';

// import {
//   BrowserRouter as Router,
//   useLocation,
//   Link
// } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import NodeClass from './NodeClass'
import RelClass from './RelationClass'
import RelDisplay from './RelationDisplay'

// Coordinate Control of Text and Annotators, Import Annotators here
export default function NodeRelationBase({task, annotatorClasses, selectedNodes, setSelectedClass, selectedClass, setSelectedRel, selectedRel, toggleRelations, setToggleRelations, showRelations, setShowRelations, relationsList}) { 
  const useStyles = makeStyles({
  });
  const classes = useStyles();

  function display_toggle_relations(){
    if (task=='ES'){
      setToggleRelations(true)
      return(
        <label>
          Toggle Relations Classes
          <input type="checkbox"
            defaultChecked={true}
            style={{margin: '10px'}}
            disabled="disabled"
            checked
          />
        </label>
      );
    } else{
      return(
        <label>
          Toggle Relations Classes
          <input type="checkbox"
            defaultChecked={toggleRelations}
            onChange={() => setToggleRelations(!toggleRelations)}
            style={{margin: '10px'}}
          />
        </label>
      );
    }
  }  

  return ( 
        <Container style={{border: '1px solid black', margin: '5px', height: 'fit-content'}}>
          <label style={{margin: '10px'}}>{task} Annotator</label>
          <Row>
            <NodeClass classes={annotatorClasses['nodes']} nodes={selectedNodes} setSelectedClass={setSelectedClass} selectedClass={selectedClass}>Node Classes</NodeClass>
          </Row>
          <Row>
            <RelClass classes={annotatorClasses['relations']} nodes={selectedNodes} setSelectedRel={setSelectedRel} selectedRel={selectedRel}>Relations Classes</RelClass> 
          </Row>
          {display_toggle_relations()}
          <label>
              Show Rel Annototations
              <input type="checkbox"
                defaultChecked={showRelations}
                onChange={() => setShowRelations(!showRelations)}
                style={{margin: '10px'}}
              />
          </label>
          <Row>
            <RelDisplay showRelations={showRelations} relationsList={relationsList}></RelDisplay>
          </Row>
        </Container>
      );
  }   