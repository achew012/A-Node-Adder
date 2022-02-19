import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';

import {
  Container,
  Button,
  Row,
} from 'react-bootstrap';

import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import { Checkbox } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import ClassManager from './ClassManager';

export default function Task({ selectedTask, setTask, annotators, type, projectName, existingDataset, selectedClasses, setClasses, AnnotateDirect, setAnnotateDirect }) {

  const useStyles = makeStyles({
    cont: {
      border: '1px solid black',
      margin: '10px',
      minHeight: '200px',
      width: '98%',
      overflow: 'auto',
    },

    tableHeader: {
      margin: '5px',
      fontSize: '0.8em',
      padding: '5px',
      fontWeight: 'bold',
      textAlign: 'center'
    },

    Grid: {
      // border: 'solid 1px black',
      minHeight: '100px',
      width: '35%',
      margin: '5px',
      fontSize: '0.7em',
      padding: '5px',
      textAlign: 'center',
      overflowWrap: 'break-word',
    },

    button: {
      margin: '5px',
      padding: '5px',
      backgroundColor: 'gray',
      border: 'solid 2px gray',
      color: 'black',
    },
    warning: {
      textAlign: "center",
      fontSize: "0.7em",
      color: "red"
    },
    checkboxlabel: {
      fontSize: "0.6em"
    }
  });

  const SERVER_URL = process.env.REACT_APP_SERVER_URL
  const classes = useStyles();
  const [selectedFile, setFile] = useState(['default']);
  const [checkboxState, setCheckBoxState] = useState(false);

  function handleDirectAnnotation(e) {
    setCheckBoxState(!checkboxState);
  }

  function onFileChange(event) {
    console.log(event)
    // Update the state 
    setFile({ 'state': event.target.files[0] });
  };

  // On file upload (click the upload button) 
  function onZipFileUpload(e) {
    console.log("file uploading...")
    // Create an object of formData 
    const formData = new FormData();

    if (selectedFile.state) {
      // Update the formData object

      formData.append(
        projectName + '///' + type + '///' + selectedFile.state.name,
        selectedFile.state,
      );

      // // Details of the uploaded file 
      console.log('filetype', selectedFile.state.type);

      if (selectedFile.state.type == "application/zip") {
        // Request made to the backend api 
        // Send formData object 
        axios.post('http://' + SERVER_URL + '/fileUpload', formData).then(res => {
          console.log(res.data);
          // setDisplay(res.data.answer);
        });
      } else {
        alert("Invalid File Type")
      }
    }
  };

  // On file upload (click the upload button) 
  function onFileUpload(e) {
    console.log("file uploading...")
    // Create an object of formData 
    const formData = new FormData();

    if (selectedFile.state) {
      // Update the formData object

      formData.append(
        projectName + '///' + type + '///' + selectedFile.state.name,
        selectedFile.state,
      );

      // // Details of the uploaded file 
      console.log('filetype', selectedFile.state.type);

      // Request made to the backend api 
      // Send formData object 
      axios.post('http://' + SERVER_URL + '/fileUpload', formData).then(res => {
        console.log(res.data);
        // setDisplay(res.data.answer);
      });
    }
  };

  // File content to be displayed after 
  // file upload is complete 
  function fileData() {
    if (selectedFile.state) {
      return (
        <div>
          <p></p>
          <p>
            File Name: {selectedFile.state.name}
          </p>
          <p>
            Last Modified:{" "}
            {selectedFile.state.lastModifiedDate.toDateString()}
          </p>
        </div>
      );
    } else {
      return (
        <p className={classes.warning}>Choose file before pressing the upload button</p>
      );
    }
  };

  function displayUploadingContainer() {
    if (checkboxState == true) {
      return (<Grid item xs={6} className={classes.Grid}>
        {displayDataset()}
      </Grid>);
    } else {
      return (
        <Grid item xs={8}>
          <Row style={{ marginLeft: "auto", marginRight: "auto" }}>
            <Grid item xs={6} className={classes.Grid}>
              <input type="file" onChange={onFileChange} accept=".zip,.rar,.7zip, audio/*" />
              {fileData()}
              <Button className={classes.button} onClick={onZipFileUpload}>Upload Audio Zip</Button>
            </Grid>
            <Grid item xs={6} className={classes.Grid}>
              {displayDataset()}
            </Grid>
          </Row >
        </Grid>
      );
    }
  }

  function displayTask() {
    switch (selectedTask) {
      case "Classes":
        return (
          <Grid item xs={8} className={classes.Grid}>
            <ClassManager selectedClasses={selectedClasses} setClasses={setClasses} type={type}></ClassManager>
          </Grid>
        );
      case "Audio":
        return (
          <Grid item xs={8} className={classes.Grid}>
            <Row>
              <Grid item xs={3} className={classes.Grid}>
                <Row style={{ marginLeft: "auto", marginRight: "auto" }}>
                  <Checkbox checked={AnnotateDirect} onChange={handleDirectAnnotation} />
                </Row>
                <Row><label>Annotate Directly</label></Row>
                <Row className={classes.warning}>(Warning: will overwrite any uploaded raw dataset)</Row>
              </Grid>
              {displayUploadingContainer()}
            </Row >
          </Grid >
        );
      // case "Custom":
      //   return (
      //     <Grid item xs={8} className={classes.Grid}>
      //       Add Fields Directly to the Annotator
      //     </Grid>
      //   );
      default:
        return (
          <Grid item xs={8} className={classes.Grid}>
            <Row>
              <Grid item xs={3} className={classes.Grid}>
                <Row style={{ marginLeft: "auto", marginRight: "auto" }}>
                  <Checkbox checked={AnnotateDirect} onChange={handleDirectAnnotation} />
                </Row>
                <Row><label>Annotate Directly</label></Row>
                <Row className={classes.warning}>(Warning: will overwrite any uploaded raw dataset)</Row>
              </Grid>
              {displayUploadingContainer()}
            </Row>
          </Grid>
        );
    }
  }

  function addDefault(event) {
    // event.preventDefault();      
    setTask("Classes")
    annotators[type] = "Classes"
  }

  function addAnnotator(event) {
    // event.preventDefault();      
    setTask(event.target.value)
    annotators[type] = event.target.value
  }

  function displayDataset() {
    if (existingDataset !== null) {
      return (
        <Container>
          Attached:
          [{
            existingDataset.join(" , ")
          }]
        </Container>);
    } else {
      return 'No Existing Dataset'
    }
  }

  function displayAnnotator() {
    if (type !== "Relation") {
      return (
        <Grid item xs={4} className={classes.Grid}>
          <FormControl style={{ minWidth: '150px' }}>
            <InputLabel>{type} Task</InputLabel>
            <Select value={selectedTask} onChange={addAnnotator}>
              <MenuItem value={'Classes'}>Classes</MenuItem>
              <MenuItem value={'Text'}>Text</MenuItem>
              <MenuItem value={'Audio'}>Audio</MenuItem>
              <MenuItem value={'Images'}>Images</MenuItem>
              {/* <MenuItem value={'Custom'}>Custom</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>
      );
    } else {
      addDefault()
      return (
        <Grid item xs={4} className={classes.Grid}>
          <FormControl style={{ minWidth: '150px' }}>
            <InputLabel>{type} Task</InputLabel>
            <Select value={"Classes"}>
              <MenuItem value={'Classes'}>Classes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }
  }

  useEffect(() => {
    if (AnnotateDirect != null) {
      setAnnotateDirect(checkboxState);
    }
  }, [checkboxState]);

  return (
    <Container className={classes.cont}>
      <Row>
        <Grid item xs={4} className={classes.tableHeader}>{type} Annotator</Grid>
        <Grid item xs={8} className={classes.tableHeader}>Dataset/Classes</Grid>
      </Row>
      <Row>
        {/* Checks what annotator to render */}
        {displayAnnotator()}
        {/* Checks what task features to render */}
        {displayTask()}
      </Row>
    </Container>
  );
}