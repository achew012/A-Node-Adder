import axios from 'axios';  
import React,{Component, useEffect, useState } from 'react'; 
import { 
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

export default function ClassManagerDisplay({annotatorsDict, annotatorCode, projectName}) {   
  const SERVER_URL = process.env.REACT_APP_SERVER_URL
  const useStyles = makeStyles({
    button: {
      margin: '5px',
      padding: '5px', 
      backgroundColor: 'gray', 
      border: 'solid 1px darkgreen',
      color: 'black',
    }
  });
  const styleclasses = useStyles();
  const [classNameInput, setClassNameInput] = useState('');
  const [classDict, setClassDict] = useState(annotatorsDict);
  const [subtype, setSubtype] = useState('nodes');
  const [time, setTime] = useState(Date.now());

  function updateAnnotator(){
    const valueHolder = {
      type: 'updateAnnotators',
      projectname: projectName,
      annotators: classDict,
    };

    axios.post('http://'+SERVER_URL+'/classes', { valueHolder }).then(res => {
          var query_obj = res.data['annotators'];
          console.log(query_obj)
          setClassDict(query_obj);
          console.log('Class Updated Successfully');
          setTime(Date.now());
        });
  }
  
  function changeSubtype(event){
    setSubtype(event.target.value);
  }

  function handleClassAdd(){
    setClassDict(annotators => (
      annotators[annotatorCode][subtype].push(classNameInput)
    ));
    updateAnnotator();
  }

  function handleClassDelete(event){
    var type = event.target.value.split('///')[0];
    var className = event.target.value.split('///')[1];
    const newClassDict = classDict
    newClassDict[annotatorCode][type] = classDict[annotatorCode][type].filter(v=>v!=className);
    setClassDict(newClassDict);
    updateAnnotator();
  }

  useEffect(() => {
  }, [time]);

  function displayClasses(){
    if (classDict[annotatorCode]!=null){
      return(
        <Container>
          <Row>
            {Object.keys(classDict[annotatorCode]).map((type, item2) => 
              <Col lg={3}>
                {
                classDict[annotatorCode][type].map((className) =>                  
                  <Button className={styleclasses.button} onClick={handleClassDelete} value={type+'///'+className}>{className}</Button>
                  )
                }
              </Col>
              )
            }
          </Row>
        </Container>
      );      
    }
  }

  // function displayDropdown(){
  //   if (annotatorCode=='ES'){
  //     return(
  //       <Select value={subtype} onChange={changeSubtype}>
  //         <MenuItem value={'relations'}>relation</MenuItem>
  //       </Select>
  //     );  
  //   } else{
  //     return(
  //       <Select value={subtype} onChange={changeSubtype}>
  //         <MenuItem value={'nodes'}>node</MenuItem>
  //         <MenuItem value={'relations'}>relation</MenuItem>
  //       </Select>
  //     );
  //   }
  // }

  return ( 
    <Container>
      <InputLabel style={{ color: 'darkgreen', textAlign: 'center'}}>
        {annotatorCode} Manager
      </InputLabel>
      {/* <Row style={{ padding: '5px', border: '1px solid black', backgroundColor: 'lightgray'}}>
        <Col sm={3}>
          <Row>
            <Input onChange={(event) => setClassNameInput(event.target.value)} placeholder={'Enter Classname'}></Input>
            {displayDropdown()}
            <Button onClick={handleClassAdd} style={{ margin: '5px', backgroundColor: 'gray' }}>Add</Button>        
          </Row>
        </Col>
        <Col sm={9}>
          <InputLabel>
            Click to Remove Existing Classes
          </InputLabel>
          {displayClasses()}
        </Col>
      </Row> */}
    </Container>
    );
}   