import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';

import {
  Container,
  Button,
} from 'react-bootstrap';

import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ClassManager from './ClassManager';

export default function Task({ selectedTask, setTask, annotators, type, projectName, existingDataset, selectedClasses, setClasses }) {

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

    tableCell: {
      // border: 'solid 1px black',
      minHeight: '100px',
      width: '33%',
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
  });

  const SERVER_URL = process.env.REACT_APP_SERVER_URL
  const classes = useStyles();
  const [selectedFile, setFile] = useState(['default']);

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
        <p>Choose file before pressing the upload button</p>
      );
    }
  };

  function displayTask() {
    switch (selectedTask) {
      case "Classes":
        return (
          <Container>
            <TableCell className={classes.tablecell}>
              <ClassManager selectedClasses={selectedClasses} setClasses={setClasses} type={type}></ClassManager>
            </TableCell>
          </Container>
        );
      case "Audio":
        return (
          <Container>
            <TableCell className={classes.tablecell}>
              <input type="file" onChange={onFileChange} accept=".zip,.rar,.7zip, audio/*" />
              {fileData()}
              <Button className={classes.button} onClick={onZipFileUpload}>Upload Audio Zip</Button>
            </TableCell>
            <TableCell className={classes.tablecell}>
              {displayDataset()}
            </TableCell>
          </Container>
        );
      default:
        return (
          <Container>
            <TableCell className={classes.tablecell}>
              <input type="file" onChange={onFileChange} />
              {fileData()}
              <Button className={classes.button} onClick={onFileUpload}>Upload</Button>
            </TableCell>
            <TableCell className={classes.tablecell}>
              {displayDataset()}
            </TableCell>
          </Container>
        );
    }
  }


  // function displayTask() {
  //   if (selectedTask != "Classes") {
  //     return (
  //       <Container>
  //         <TableCell className={classes.tablecell}>
  //           <input type="file" onChange={onFileChange} />
  //           {fileData()}
  //           <Button className={classes.button} onClick={onFileUpload}>Upload</Button>
  //         </TableCell>
  //         <TableCell className={classes.tablecell}>
  //           {displayDataset()}
  //         </TableCell>
  //       </Container>
  //     );
  //   } else {
  //     return (
  //       <Container>
  //         <TableCell className={classes.tablecell}>
  //           <ClassManager selectedClasses={selectedClasses} setClasses={setClasses} type={type}></ClassManager>
  //         </TableCell>
  //       </Container>
  //     );
  //   }
  // }

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
    if (existingDataset != null) {
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
    if (type != "Relation") {
      return (
        <TableCell className={classes.tableCell}>
          <FormControl style={{ minWidth: '150px' }}>
            <InputLabel>{type} Task</InputLabel>
            <Select value={selectedTask} onChange={addAnnotator}>
              <MenuItem value={'Classes'}>Classes</MenuItem>
              <MenuItem value={'Text'}>Text</MenuItem>
              <MenuItem value={'Audio'}>Audio</MenuItem>
              <MenuItem value={'Images'}>Images</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
      );
    } else {
      addDefault()
      return (
        <TableCell className={classes.tableCell}>
          <FormControl style={{ minWidth: '150px' }}>
            <InputLabel>{type} Task</InputLabel>
            <Select value={"Classes"}>
              <MenuItem value={'Classes'}>Classes</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
      );
    }
  }

  return (
    <Container className={classes.cont}>
      <TableRow>
        <TableCell className={classes.tableHeader}>{type} Annotator</TableCell>
        <TableCell className={classes.tableHeader}>Dataset/Classes</TableCell>
      </TableRow>
      <TableRow>
        {/* Checks what annotator to render */}
        {displayAnnotator()}
        {/* Checks what task features to render */}
        {displayTask()}
      </TableRow>
    </Container>
  );
}