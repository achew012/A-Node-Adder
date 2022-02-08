import axios from 'axios';  
import React,{Component, useEffect, useState} from 'react'; 

import { 
  Container,
  Row,
  Button
} from 'react-bootstrap';

import {
  BrowserRouter as Router,
  useLocation,
  Link,
  Redirect,
} from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import ClassInput from './ClassManager';

export default function Project() { 

    const SERVER_URL = process.env.REACT_APP_SERVER_URL
    const useStyles = makeStyles({
      cont: {
          border: '1px solid black',
          minHeight: 600,
      },

      tablecell: {
          // border: 'solid 1px black',
          minHeight: 100,        
          margin: '10px',
          fontSize:  '1em',
          padding: '20px',
          overflowWrap: 'break-word',
      },
      button: {
        margin: '5px',
        padding: '5px', 
        backgroundColor: 'gray', 
        border: 'solid 2px gray',
        color: 'black',
      },
      deadbutton: {
        margin: '5px',
        padding: '5px', 
        backgroundColor: 'lightgray', 
        border: 'solid 2px black',
        color: 'lightgray',
      }

    });

    const classes = useStyles();
    const location = useLocation();
    const projectName = location.state.projectname; 
    const userName = location.state.user;   
    const [selectedFile, setFile] = useState(['default']);
    const [selectedSRCTask, setSRCTask] = useState('');
    const [selectedTGTTask, setTGTTask] = useState('');
    // facilitates the dropdown function
    //const [annotators, setAnnotators] = useState(new Set());
    const [annotators, setAnnotators] = useState({});
    const [annotationsfordownload, setAnnotationsForDownload] = useState([]);
    
    // facilitates display of existing dataset chosen previously
    const [existingDataset, setDatasetDisplay] = useState('No Existing Datasets');
    const [time, setTime] = useState(Date.now());

    function checkUser(){
      if (userName==null){
        return(<Redirect
                  to={{
                      pathname: "/",
                  }}
                  />);
      }  
    }

    function onFileChange(event) {
      console.log(event) 
      // Update the state 
      setFile({'state': event.target.files[0]});      
    }; 

    // On file upload (click the upload button) 
    function onFileUpload() {      

      if (existingDataset!=null){
        // Create an object of formData 
        const formData = new FormData(); 

        if (selectedFile.state) {
        // Update the formData object
    
        formData.append(
          projectName+'///'+selectedFile.state.name,
          selectedFile.state,
          ); 

        // // Details of the uploaded file 
        console.log('filetype', selectedFile.state.type); 
      
        // Request made to the backend api 
        // Send formData object 
        axios.post('http://'+SERVER_URL+'/file', formData).then(res => {
              console.log(res.data);            
              // setDisplay(res.data.answer);
            });
        setTime(Date.now()); 
        }
      } 
    };  

    // File content to be displayed after 
    // file upload is complete 
    function fileData(){      
      if (selectedFile.state) {          
        return ( 
          <div>  
            <p>File Name: {selectedFile.state.name}</p> 
            <p> 
              Last Modified:{" "} 
              {selectedFile.state.lastModifiedDate.toDateString()} 
            </p> 
          </div> 
        ); 
      } else { 
        return ( 
          <div> 
            <p>Choose file before pressing the upload button</p> 
          </div> 
        ); 
      } 
    };

    function registerAnnotators(){

      const valueHolder = {
        type: 'add_annotators',
        annotators: annotators,
        projectname: projectName,        
      };
     
      axios.post('http://'+SERVER_URL+'/project', valueHolder).then(res => {
        console.log('Project Updated! Added annotators to database');
          });
      
      setTime(Date.now());
    }

    // function addAnnotator(event){
    //   // event.preventDefault();      
    //   setTask(event.target.value);
    //   if (annotators.hasOwnProperty(event.target.value)==false){
    //     //setAnnotators(annotators => ...annotators[event.target.value] = {})
    //     var temp = {}
    //     temp[event.target.value] = {'nodes': [], 'relations': []};
    //     setAnnotators(annotators => (
    //       Object.assign({}, annotators, temp)
    //     ));
    //   }
    //   registerAnnotators()      
    // }

    function addSRCAnnotator(event){
      // event.preventDefault();      
      setSRCTask(event.target.value);
      if (annotators.hasOwnProperty(event.target.value)==false){
        //setAnnotators(annotators => ...annotators[event.target.value] = {})
        var temp = {}
        temp[event.target.value] = {'nodes': [], 'relations': []};
        setAnnotators(annotators => (
          Object.assign({}, annotators, temp)
        ));
      }
      // registerAnnotators()      
    }

    function addTGTAnnotator(event){
      // event.preventDefault();      
      setSRCTask(event.target.value);
      if (annotators.hasOwnProperty(event.target.value)==false){
        //setAnnotators(annotators => ...annotators[event.target.value] = {})
        var temp = {}
        temp[event.target.value] = {'nodes': [], 'relations': []};
        setAnnotators(annotators => (
          Object.assign({}, annotators, temp)
        ));
      }
      // registerAnnotators()      
    }

    function getProjectDetails(){
      console.log('reload state of project');
      const valueHolder = {
        type: 'reload_state',
        projectname: projectName,        
      };
     
      axios.post('http://'+SERVER_URL+'/project', valueHolder).then(res => {
            var reloadState = res['data']
            console.log(reloadState);
            setDatasetDisplay(reloadState['dataset']);
            setAnnotationsForDownload(reloadState['annotations']);           
            if (reloadState['annotators']!=null){
              var new_annotators = Object.assign({}, annotators, reloadState['annotators']);
              setAnnotators(new_annotators);            
            }
          });      
    }

    function removeAnnotator(event){
      // event.preventDefault();
      delete annotators[event.target.value];
      console.log(annotators);
      registerAnnotators();
      setTime(Date.now());
    }

    function displayDataset(){
      if (existingDataset!=null){
        return existingDataset
      }else{
        return 'No Existing Dataset'
      }
    }

    function checkAnnotators(){
      return(
        <ClassInput annotatorsDict={annotators} projectName={projectName}></ClassInput>
      );      
    }

    function downloadAnnotations(){
      return(<a
        href={`data:text/jsonl;charset=utf-8,${encodeURIComponent(
        JSON.stringify(annotationsfordownload)
        )}`}
        download="Annotations.jsonl"
        ><Button className={classes.button}
        >
      {'Download Annotations'}
        </Button>
      </a>);
    }

    function annotateButton(){
      if (annotators!=null & annotationsfordownload.length>0){
        //toggle between active annotations or dead buttons for no annotations to edit
        if (Object.keys(annotators).length>0){
          return(
            <TableCell colSpan={3}>
              <Link  to={{pathname: "/projects", state: {projectname: projectName, user: userName }}}><Button className={classes.button}>Back</Button></Link>            
              <Link to={{pathname: "/annotate", state: {projectname: projectName, annotators: annotators, annotations: annotationsfordownload, user: userName}}}><Button className={classes.button}>Annotate / Edit</Button></Link>
              {downloadAnnotations()}
            </TableCell>
          );    
        }else{
          return(
            <TableCell colSpan={3}>
              <Link  to={{pathname: "/projects", state: {projectname: projectName, user: userName }}}><Button className={classes.button}>Back</Button></Link>            
              <Button className={classes.deadbutton}>Annotate / Edit</Button>
            </TableCell>
            );
        }
      }else{
        return(
          <TableCell colSpan={3}>
              <Link  to={{pathname: "/projects", state: {projectname: projectName, user: userName }}}><Button className={classes.button}>Back</Button></Link>            
            <Button className={classes.deadbutton}>Annotate / Edit</Button>
          </TableCell>
        );  
      }
    }

    useEffect(() => {
      getProjectDetails();
    }, [time]);

    useEffect(() => {
    }, [annotators]);

    return ( 
        <Container className={classes.cont}>
          {checkUser()}
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Project Name: {projectName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.tablecell}>Dataset:</TableCell>
                <TableCell className={classes.tablecell}>
                  <Container>
                    <input type="file" onChange={(event) => onFileChange(event)} /> 
                    <button onClick={onFileUpload}> 
                      Upload 
                    </button> 
                    {fileData()}
                  </Container>
                </TableCell>
                <TableCell className={classes.tablecell} style={{textAlign:'center', fontSize:  '1em',}}>
                  Attached Dataset: [ {displayDataset()} ]
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.tablecell}>Source Annotator:</TableCell>
                <TableCell className={classes.tablecell}>
                  <FormControl style={{minWidth:'300px'}}> 
                    <InputLabel>Task</InputLabel>
                    <Select value={selectedSRCTask} onChange={addSRCAnnotator}>
                      <MenuItem value={'Classes'}>Classes</MenuItem>
                      <MenuItem value={'Text'}>Text</MenuItem>
                      <MenuItem value={'Audio'}>Audio</MenuItem>
                      <MenuItem value={'Images'}>Images</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className={classes.tablecell}>Target Annotator:</TableCell>
                <TableCell className={classes.tablecell}>
                  <FormControl style={{minWidth:'300px'}}> 
                    <InputLabel>Task</InputLabel>
                    <Select value={selectedTGTTask} onChange={addTGTAnnotator}>
                      <MenuItem value={'Classes'}>Classes</MenuItem>
                      <MenuItem value={'Text'}>Text</MenuItem>
                      <MenuItem value={'Audio'}>Audio</MenuItem>
                      <MenuItem value={'Images'}>Images</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell className={classes.tablecell} style={{textAlign:'center'}}>
                  {Object.keys(annotators).map((key, item) => 
                    <ul><Button value={key} onClick={removeAnnotator}>{'Remove '+key}</Button></ul>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}>
                  {checkAnnotators()}
                </TableCell>
              </TableRow>
              <TableRow>
                {annotateButton()}
              </TableRow>
            </TableBody>
          </Table>          
        </Container>
      );
  }   