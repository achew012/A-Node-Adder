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
import Task from './Task';

export default function Project() { 

    const SERVER_URL = process.env.REACT_APP_SERVER_URL
    const useStyles = makeStyles({
      cont: {
          border: '1px solid black',
          minHeight: 600,
          width: '98%',
          padding: '5px'
      },

      tableHeader: {
        // border: 'solid 1px black',
        minHeight: 100,        
        margin: '10px',
        fontSize:  '1em',
        padding: '20px',
        overflowWrap: 'break-word',
      },

      tableCell: {
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
    });

    const classes = useStyles();
    
    // const location = useLocation();
    // const projectName = location.state.projectname; 
    // const userName = location.state.user;   
    const projectName = "test"; 
    const userName = "tester";   

    // facilitates the dropdown function
    const [annotators, setAnnotators] = useState({Source:"", Target:"", Relation:[]});
    const [selectedClasses, setClasses] = useState({Source:[], Target:[], Relation:[]});
    const [selectedSRCTask, setSRCTask] = useState(annotators["Source"]);
    const [selectedTGTTask, setTGTTask] = useState(annotators["Target"]);
    const [selectedRELTask, setRELTask] = useState(annotators["Relation"]);
    const [annotationsfordownload, setAnnotationsForDownload] = useState([]);
    
    // facilitates display of existing dataset chosen previously
    const [existingTgtDataset, setTgtDatasetDisplay] = useState(null);
    const [existingSrcDataset, setSrcDatasetDisplay] = useState(null);
    const [existingTriplesDataset, setTriplesDatasetDisplay] = useState(null);
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

    function cacheClasses(){
      // annotators
      // selectedClasses
      console.log("Caching Classes...")
      console.log(annotators)
      console.log(selectedClasses)
    }

    // Used to retrieve cached data
    function getProjectDetails(type){
      console.log('Initializing any existing ' + type + ' datasets');
      const valueHolder = {
        type: type,
        projectname: projectName,        
      };
      
      axios.post('http://'+SERVER_URL+'/project', valueHolder).then(res => {
            var reloadState = res['data']
            console.log(reloadState)
            if (type=="Source" && reloadState['answer']!=null){
              console.log("Detected existing source dataset");
              setSrcDatasetDisplay(reloadState['answer']);
            } else if (type=="Target" && reloadState['answer']!=null){
              console.log("Detected existing target dataset");
              setTgtDatasetDisplay(reloadState['answer']);
            } 
            // setAnnotationsForDownload(reloadState['annotations']);           
          });      
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
        //toggle between active annotations or dead buttons if no annotations to edit
        if (true){
          return(
            <TableCell colSpan={3}>
              <Link  to={{pathname: "/projects", state: {projectname: projectName, user: userName }}}><Button className={classes.button}>Back</Button></Link>            
              <Link to={{pathname: "/annotate", state: {projectname: projectName, user: userName, annotators: annotators, definedClasses: selectedClasses}}}><Button className={classes.button} onClick={cacheClasses}>Annotate / Edit</Button></Link>
              {/* {downloadAnnotations()} */}
            </TableCell>
          );    
        }
    }

    // useEffect(() => {
    // }, [existingTgtDataset, existingSrcDataset]);

    useEffect(() => {
      getProjectDetails("Source");
      getProjectDetails("Target");
    }, []);

    useEffect(() => {
    }, [annotators]);

    return ( 
        <Container>
          {checkUser()}
          <Table className={classes.cont}>
            <TableBody>
              <TableRow>
                <TableCell>Project Name: {projectName}</TableCell>
              </TableRow>

              <Task 
                selectedTask={selectedSRCTask} 
                setTask={setSRCTask} 
                annotators={annotators} 
                type={"Source"} 
                SERVER_URL={SERVER_URL} 
                projectName={[projectName]} 
                existingDataset={existingSrcDataset}
                selectedClasses={selectedClasses} 
                setClasses={setClasses}
              ></Task>

              <Task 
                selectedTask={selectedTGTTask} 
                setTask={setTGTTask} 
                annotators={annotators} 
                type={"Target"} 
                SERVER_URL={SERVER_URL} 
                projectName={[projectName]} 
                existingDataset={existingTgtDataset}
                selectedClasses={selectedClasses} 
                setClasses={setClasses}
              ></Task>

              <Task 
                selectedTask={selectedRELTask} 
                setTask={setRELTask} 
                annotators={annotators} 
                type={"Relation"} 
                SERVER_URL={SERVER_URL}
                projectName={[projectName]} 
                existingDataset={existingTriplesDataset}
                selectedClasses={selectedClasses} 
                setClasses={setClasses}
              ></Task>

              <TableRow>
                {annotateButton()}
              </TableRow>

            </TableBody>
          </Table>          
        </Container>
      );
  }   