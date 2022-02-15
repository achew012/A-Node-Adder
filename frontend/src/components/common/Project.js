import axios from 'axios';
import React, { useEffect, useState } from 'react';

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

import { makeStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import Task from './Task';

export default function Project() {

  const SERVER_URL = process.env.REACT_APP_SERVER_URL
  const useStyles = makeStyles({
    cont: {
      border: '1px solid black',
      minHeight: 600,
      width: '96%',
      padding: '30px',
      fontSize: '1.5em',
    },

    // tableHeader: {
    //   // border: 'solid 1px black',
    //   minHeight: 100,
    //   margin: '10px',
    //   fontSize: '1em',
    //   padding: '20px',
    //   overflowWrap: 'break-word',
    // },

    // tableCell: {
    //   // border: 'solid 1px black',
    //   minHeight: 100,
    //   margin: '10px',
    //   fontSize: '1em',
    //   padding: '20px',
    //   overflowWrap: 'break-word',
    // },

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
  const [annotators, setAnnotators] = useState({ Source: "", Target: "", Relation: [] });
  const [selectedClasses, setClasses] = useState({ Source: [], Target: [], Relation: [] });
  const [selectedSRCTask, setSRCTask] = useState(annotators["Source"]);
  const [selectedTGTTask, setTGTTask] = useState(annotators["Target"]);
  const [selectedRELTask, setRELTask] = useState(annotators["Relation"]);
  const [annotationsfordownload, setAnnotationsForDownload] = useState([]);

  // facilitates display of existing dataset chosen previously
  const [existingTgtDataset, setTgtDatasetDisplay] = useState(null);
  const [existingSrcDataset, setSrcDatasetDisplay] = useState(null);
  const [existingTriplesDataset, setTriplesDatasetDisplay] = useState(null);
  const [time, setTime] = useState(Date.now());

  function checkUser() {
    if (userName == null) {
      return (<Redirect
        to={{
          pathname: "/",
        }}
      />);
    }
  }

  function cacheClasses() {
    // annotators
    // selectedClasses
    console.log("Caching Classes...")
    console.log(annotators);
    console.log(selectedClasses);

    const valueHolder = {
      annotators: annotators,
      classes: selectedClasses,
      projectname: projectName,
    };

    axios.post('http://' + SERVER_URL + '/cacheClasses', { valueHolder }).then(res => {
      var response = res['data']
      console.log("Class Caching status:", response)
    });
  }

  function getCachedClasses() {
    console.log("Fetching Cached Classes...")

    const valueHolder = {
      projectname: projectName,
    };

    axios.post('http://' + SERVER_URL + '/getClasses', { valueHolder }).then(res => {
      var response = res['data']
      console.log("Retrieved Existing Classes", response)
      setClasses(response["classes"]);
      setAnnotators(response["annotators"]);
    });
  }


  // Used to retrieve cached data
  function getProjectDetails(type) {
    console.log('Initializing any existing ' + type + ' datasets');
    const valueHolder = {
      type: type,
      projectname: projectName,
    };

    axios.post('http://' + SERVER_URL + '/project', valueHolder).then(res => {
      var reloadState = res['data']
      console.log(reloadState)
      if (type == "Source" && reloadState['answer'] != null) {
        console.log("Detected existing source dataset");
        setSrcDatasetDisplay(reloadState['answer']);
      } else if (type == "Target" && reloadState['answer'] != null) {
        console.log("Detected existing target dataset");
        setTgtDatasetDisplay(reloadState['answer']);
      }
      // setAnnotationsForDownload(reloadState['annotations']);           
    });
  }

  function downloadAnnotations() {
    return (<a
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

  function annotateButton() {
    //toggle between active annotations or dead buttons if no annotations to edit
    if (true) {
      return (
        <Grid item xs={4}>
          <Link to={{ pathname: "/projects", state: { projectname: projectName, user: userName } }}><Button className={classes.button}>Back</Button></Link>
          <Button className={classes.button} onClick={cacheClasses}> Save Settings </Button>
          <Link to={{ pathname: "/annotate", state: { projectname: projectName, user: userName, annotators: annotators, definedClasses: selectedClasses } }}><Button className={classes.button}>Annotate / Edit</Button></Link>
          {/* {downloadAnnotations()} */}
        </Grid>
      );
    }
  }

  useEffect(() => {
    getProjectDetails("Source");
    getProjectDetails("Target");
    getCachedClasses();
  }, []);

  useEffect(() => {
    setSRCTask(annotators["Source"])
    setTGTTask(annotators["Target"])
    setRELTask(annotators["Relation"])
  }, [annotators, selectedClasses]);

  return (
    <Container className={classes.cont}>
      {checkUser()}
      <Row>
        <Grid item xs={4}></Grid>
        <Grid item xs={4} style={{ "textAlign": "center" }}>Project Name: {projectName}</Grid>
        <Grid item xs={4}></Grid>
      </Row>

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

      <Row>
        <Grid item xs={4}></Grid>
        {annotateButton()}
        <Grid item xs={4}></Grid>
      </Row>
    </Container >
  );
}