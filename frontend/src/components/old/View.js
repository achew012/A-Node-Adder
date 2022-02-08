import React, {Component, useEffect, useState, useRef} from 'react'; 

import { 
  Container,
  Col,
  Row,
  Button,
} from 'react-bootstrap';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextBase from '../annotators/TextBase'
import RelAnnotator from '../annotators/RelationAnnotator'
import NodeRelBase from '../annotators/NodeRelationBase'


// Coordinate Control of Text and Annotators, Import Annotators here
export default function View({selectedTask, annotators, tokens, selectedNodes, relationsList, savetoAnnotations, loadfromAnnotations}) { 

  //Controls the current class selected
  const selectedClass = useRef('Default');
  const selectedRel = useRef('Default');

  const [toggleRelations, setToggleRelations] = useState(false);
  const [showRelations, setShowRelations] = useState(false); 

  const [time, setTime] = useState(Date.now());

  function setSelectedClass(className){
    selectedClass.current=className;
    setTime(Date.now());
  }

  function setSelectedRel(RelName){
    selectedRel.current=RelName;
    setTime(Date.now());
  }

  function addRel2List(RelName, RelSourceTarget){
    relationsList.current.push([selectedRel.current,  RelSourceTarget, RelName]);
    setTime(Date.now());
    return relationsList.current;
  }

  function toggleNodeRel(){ //Text Annotation Methods (Pink/Blue Highlights)
    if (toggleRelations==false && selectedTask.current!='ES'){
      return(<TextBase tokens={tokens} nodes={selectedNodes.current} nodeClass={selectedClass.current}></TextBase>);      
    }
      return(<RelAnnotator tokens={tokens} nodes={selectedNodes.current} addRel2List={addRel2List}></RelAnnotator>);
  
  }

  function toggleAnnotator(event){
    savetoAnnotations();
    selectedTask.current = event.target.value;
    loadfromAnnotations();
    setTime(Date.now());
  }

  function displayAnnotators(){
    if (selectedTask.current!=''){
      return(
        <NodeRelBase
            task={selectedTask.current}
            annotatorClasses={annotators[selectedTask.current]}
            selectedNodes={selectedNodes}
            setSelectedClass={setSelectedClass}
            selectedClass={selectedClass}
            setSelectedRel={setSelectedRel}
            selectedRel={selectedRel}
            toggleRelations={toggleRelations}
            setToggleRelations={setToggleRelations}
            showRelations={showRelations}
            setShowRelations={setShowRelations}
            relationsList={relationsList}
        ></NodeRelBase>
      );  
    }
  }

  useEffect(() => {
  }, [time]);

  return (
    <Row>
      <Col sm={7} style={{border: '1px solid black', minHeight: '900px', margin: '5px', padding: '5px', overflowX: 'hidden', overflowY: 'auto'}}>
        {toggleNodeRel()}
      </Col>
      <Col sm={4} style={{border: '1px solid black', minHeight: '900px', margin: '5px', padding: '10px', overflowX: 'hidden', overflowY: 'auto'}}>
        <FormControl style={{minWidth:'300px'}}> 
          <InputLabel style={{Width:'90%', textAlign: 'center'}}>Select Annotator</InputLabel>
          <Select fluid style={{Width:'90%'}} 
            getOptionLabel={({ selectedTask }) => selectedTask}
            getOptionValue={({ selectedTask }) => selectedTask} 
            onChange={toggleAnnotator}>
            {Object.keys(annotators).map((key, item)=>
              <MenuItem value={key}>{key} Annotator</MenuItem>
            )}
          </Select>
        </FormControl>
        
        {displayAnnotators()}
      </Col>
    </Row>
    );
  }   
