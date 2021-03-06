import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { Component, useEffect, useState, useRef } from 'react';

import {
  Container,
  Col,
  Row,
  Button,
} from 'react-bootstrap';

import {
  useLocation,
  Link,
  Redirect,
} from 'react-router-dom';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextFrame from '../annotators/Text/TextFrame';
import AudioFrame from '../annotators/Audio/AudioFrame';

// Coordinate Control of Text and Annotators, Import Annotators here
export default function Annotate({ }) {
  const useStyles = makeStyles({
    source: {
      minHeight: '250px',
      maxHeight: '500px',
      border: '1px solid black',
      marginRight: '1px',
      marginBottom: '1px',
      textAlign: 'center',
      overflowWrap: "auto"
    },
    target: {
      minHeight: '250px',
      maxHeight: '500px',
      border: '1px solid black',
      marginRight: '1px',
      marginBottom: '1px',
      textAlign: 'center',
      overflowWrap: "auto"
    },
    annotations: {
      maxHeight: '1000px',
      border: '1px solid black',
      marginBottom: '1px',
      textAlign: 'center',
      overflowY: 'scroll',
      padding: '5px',
    },

    annotator: {
      minHeight: '80px',
      textAlign: 'center',
    },

    selectedoutput: {
      overflowWrap: 'break-word',
      minHeight: '50px',
      border: 'solid 2px gray',
      textAlign: 'center',
    },

    triplesDisplay: {
      overflowWrap: 'break-word',
      border: 'solid 1px gray',
      textAlign: 'center',
    },

    tableHeader: {
      // border: 'solid 1px black',
      minHeight: 100,
      margin: '10px',
      fontSize: '1em',
      padding: '20px',
      overflowWrap: 'break-word',
    },

    tableCell: {
      // border: 'solid 1px black',
      minHeight: 100,
      margin: '10px',
      fontSize: '1em',
      padding: '20px',
      overflowWrap: 'break-word',
    },

    button: {
      minWidth: '100px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '5px',
      marginBottom: '5px',
      padding: '5px',
      backgroundColor: 'gray',
      border: 'solid 2px gray',
      color: 'black',
      fontSize: '0.9em',
    },

  });

  const classes = useStyles();
  const SERVER_URL = process.env.REACT_APP_SERVER_URL

  const location = useLocation();

  const projectName = location.state.projectname;
  const userName = location.state.user;

  // Manages the boolean on where user is adding custom fields directly in src or tgt or reading from an existing dataset
  const srcAnnotateDirect = location.state.srcAnnotateDirect;
  const tgtAnnotateDirect = location.state.tgtAnnotateDirect;

  //Manages the class and modality configuration saved from project settings
  const annotators = location.state.annotators;
  const definedClasses = location.state.definedClasses;
  const targetClasses = definedClasses["Target"]
  const sourceClasses = definedClasses["Source"]
  const relationClasses = definedClasses["Relation"]

  const selectedTask = useRef("");
  // const dataset = useRef([[]]);
  // tracks the current sample index for source and target annotators
  const [srctokenIndex, setSRCTokenIndex] = useState(0)
  const [tgttokenIndex, setTGTTokenIndex] = useState(0)
  // tracks the current mentions highlighted in the current sample
  const [srcMentions, setSrcMentions] = useState({ value: [] });
  const [tgtMentions, setTgtMentions] = useState({ value: [] });
  // holds the value of the selected source/target mention in the currently annotated triple 
  const [selectedSrc, setSelectedSrc] = useState("");
  const [selectedRel, setSelectedRel] = useState("default");
  const [selectedTgt, setSelectedTgt] = useState("");
  // holds all the triples that have been annotated
  const [annotatedTriples, setAnnotatedTriples] = useState([]);
  // caches all highlighted mentions in all documents
  const [srcMentionsList, setSrcMentionsList] = useState({});
  const [tgtMentionsList, setTgtMentionsList] = useState({});

  // holds the path or tokens of the base data in each component
  const [srcTokensList, setSrcTokensList] = useState([['Placeholder Document']]);
  const [tgtTokensList, setTgtTokensList] = useState([['Placeholder Document']]);

  const [mediaList, setMediaList] = useState([['Placeholder Media']]);
  const [objURL, setObjURL] = useState('')

  function handleSrcSelection(e) {
    e.preventDefault();
    setSelectedSrc(e.target.value);
  }

  function handleTgtSelection(e) {
    e.preventDefault();
    setSelectedTgt(e.target.value);
  }

  function handleRelSelection(e) {
    e.preventDefault();
    setSelectedRel(e.target.value);
  }

  function handleEnterButton(e) {
    e.preventDefault();
    setAnnotatedTriples(annotatedTriples => [...annotatedTriples, [
      selectedSrc, selectedRel, selectedTgt, [srctokenIndex, tgttokenIndex],
    ]]);
  }

  function handleTripleDelete(e) {
    e.preventDefault();
    // var newTriplesArray = annotatedTriples.filter((_, index) => index !== parseInt(e.target.value))
    setAnnotatedTriples(annotatedTriples.filter((_, index) => index !== parseInt(e.target.value)));
  }

  function checkUser() {
    if (userName == null) {
      return (<Redirect
        to={{
          pathname: "/",
        }}
      />);
    }
    if (projectName == null || srcAnnotateDirect == null || tgtAnnotateDirect == null || annotators == null || definedClasses == null) {
      return (<Redirect
        to={{
          pathname: "/projectmanager",
        }}
      />);
    }
  }

  function saveTriples() {
    console.log("Uploading triples...")
    // Create an object of formData 

    const valueHolder = {
      projectname: projectName,
      triples: annotatedTriples,
    };

    // Request made to the backend api 
    axios.post('http://' + SERVER_URL + '/annotateTriples', { valueHolder }).then(res => {
      var result = res.data
      console.log(result)
      if (result.hasOwnProperty("error") == false) {
        alert("Upload Successful.")
      }
    });
  };

  function saveMentions(annotatorType, mentionsList) {
    console.log("Uploading mentions...")
    // Create an object of formData 

    const valueHolder = {
      projectname: projectName,
      type: annotatorType,
      mentions: mentionsList,
    };

    // Request made to the backend api 
    axios.post('http://' + SERVER_URL + '/annotateMentions', { valueHolder }).then(res => {
      var result = res.data
      console.log(result)
      if (result.hasOwnProperty("error") == false) {
        alert("Upload Successful.")
      }
    });
  };

  function getExistingAnnotations(operationType) {
    const valueHolder = {
      type: operationType,
      projectname: projectName,
    };

    axios.post('http://' + SERVER_URL + '/existingAnnotations', { valueHolder }).then(res => {
      console.log(res.data)
      if (res.data.hasOwnProperty("error")) {
        console.log("no existing annotations found")
      } else {
        var existingAnnotations = res.data["annotations"];
        switch (operationType) {
          case "getSource":
            setSrcMentionsList(existingAnnotations);
            break;
          case "getTarget":
            setTgtMentionsList(existingAnnotations);
            break;
          case "getTriple":
            setAnnotatedTriples([...existingAnnotations]);
            break;
        }
      }

    }
    );
  }

  //get media chunk
  function getDataSlice(annotatorType, filename) {
    const query = `http://${SERVER_URL}/getDataSlice?annotatortype=${annotatorType}&projectname=${projectName}&filename=${filename}`;
    console.log(query);
    setObjURL(query);
  }

  //get source, get target, get relations for initialization
  function getRawData(operationType, modality) {
    const valueHolder = {
      type: operationType,
      modality: modality,
      projectname: projectName,
    };

    if (modality != "Classes") {
      axios.post('http://' + SERVER_URL + '/annotateRaw', { valueHolder }).then(res => {
        switch (modality) {
          case "Text":
            var tokensDataset = res.data["data"];
            switch (operationType) {
              case "getSource":
                var tempArray = srcTokensList
                var newTokenslist = tempArray.concat(tokensDataset)
                if (srcAnnotateDirect == true) {
                  break;
                } else {
                  setSrcTokensList(newTokenslist);
                  break;
                }
              case "getTarget":
                var tempArray = tgtTokensList
                var newTokenslist = tempArray.concat(tokensDataset)
                if (tgtAnnotateDirect == true) {
                  break;
                } else {
                  setTgtTokensList(newTokenslist);
                  break;
                }
            }
            break;

          case "Audio":
            var audioDataset = res.data["data"];

            switch (operationType) {
              case "getSource":
                if (srcAnnotateDirect == true) {
                  break;
                } else {
                  setMediaList(audioDataset)
                  break;
                }
              case "getTarget":
                var tempArray = tgtTokensList
                var newTokenslist = tempArray.concat(tokensDataset)
                if (tgtAnnotateDirect == true) {
                  break;
                } else {
                  setMediaList(audioDataset)
                  break;
                }
            }
            break;
        }
      }
      );
    }
  }

  function renderAnnotatedTriples() {
    return (
      annotatedTriples.map((item, index) =>
        <Container style={{ margin: "10px" }}>
          <Row style={{ margin: '2px' }}>
            <Grid item xs={8}>
              <InputLabel>Triple {index}</InputLabel>
            </Grid>
            <Grid item xs={4}>
              <Button className={classes.button} value={index} onClick={handleTripleDelete}>Delete</Button>
            </Grid>
          </Row>
          <Row className={classes.triplesDisplay} item xs={4}>
            <Grid item xs={2}>Source</Grid>
            <Grid item xs={2}>Doc {item[3][0]}</Grid>
            <Grid item xs={8}>{displaySelectedMention(item[0])}</Grid>
          </Row>
          <Row className={classes.triplesDisplay} item xs={4}>
            <Grid item xs={2}>Relation</Grid>
            <Grid item xs={10}>{item[1]}</Grid>
          </Row>
          <Row className={classes.triplesDisplay} item xs={4}>
            <Grid item xs={2}>Target</Grid>
            <Grid item xs={2}>Doc {item[3][1]}</Grid>
            <Grid item xs={8}>{displaySelectedMention(item[2])}</Grid>
          </Row>
        </Container>
      )
    );
  }

  function renderSourceTask() {
    switch (annotators["Source"]) {
      case "Text":
        return <TextFrame tokenIndex={srctokenIndex} setTokenIndex={setSRCTokenIndex} tokensList={srcTokensList} mentions={srcMentions} setMentions={setSrcMentions} saveMentions={saveMentions} mentionsList={srcMentionsList} setMentionsList={setSrcMentionsList} annotatorType={"Source"}
          AnnotateDirect={srcAnnotateDirect}></TextFrame>
      case "Audio":
        return <AudioFrame tokenIndex={tgttokenIndex} setTokenIndex={setTGTTokenIndex} audioList={mediaList} mentions={tgtMentions} setMentions={setTgtMentions} saveMentions={saveMentions} mentionsList={tgtMentionsList} setMentionsList={setTgtMentionsList} annotatorType={"Target"} getDataSlice={getDataSlice} objURL={objURL} AnnotateDirect={srcAnnotateDirect}></AudioFrame>
      case "Image":
        return <Container><InputLabel>Image Annotator Coming Soon...</InputLabel></Container>;
      case "Custom":
        return <Container><InputLabel>Custom Annotator</InputLabel></Container>;
      default:
        return <Container><InputLabel>Blank Space</InputLabel></Container>;
    }
  }

  function renderTargetTask() {
    switch (annotators["Target"]) {
      case "Text":
        return <TextFrame tokenIndex={tgttokenIndex} setTokenIndex={setTGTTokenIndex} tokensList={tgtTokensList} mentions={tgtMentions} setMentions={setTgtMentions} saveMentions={saveMentions} mentionsList={tgtMentionsList} setMentionsList={setTgtMentionsList} annotatorType={"Target"} AnnotateDirect={tgtAnnotateDirect}></TextFrame>
      case "Audio":
        return <AudioFrame tokenIndex={tgttokenIndex} setTokenIndex={setTGTTokenIndex} audioList={mediaList} mentions={tgtMentions} setMentions={setTgtMentions} saveMentions={saveMentions} mentionsList={tgtMentionsList} setMentionsList={setTgtMentionsList} annotatorType={"Target"} getDataSlice={getDataSlice} objURL={objURL} AnnotateDirect={tgtAnnotateDirect}></AudioFrame>
      case "Image":
        return <Container><InputLabel>Image Annotator Coming Soon...</InputLabel></Container>;
      case "Custom":
        return <Container><InputLabel>Custom Annotator</InputLabel></Container>;
      default:
        return <Container><InputLabel>Blank Space</InputLabel></Container>;
    }
  }

  function renderMentions(type) {
    switch (type) {
      case "Target":
        switch (annotators["Target"]) {
          case "Classes":
            return (
              <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleTgtSelection}>
                {targetClasses.map((item) =>
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                )}
              </Select>
            );
          case "Audio":
            if (tgtAnnotateDirect == true) {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleTgtSelection}>
                  {targetClasses.map((item) =>
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  )}
                </Select>
              );
            } else {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleTgtSelection}>
                  {tgtMentions.value.map((item) =>
                    <MenuItem key={item.join(" , ")} value={item}>{item.join(" , ")}</MenuItem>
                  )}
                </Select>
              );
            }
          default:
            if (tgtAnnotateDirect == true) {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleTgtSelection}>
                  {tgtMentions.value.map((item) =>
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  )}
                </Select>
              );
            } else {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleTgtSelection}>
                  {tgtMentions.value.map((item) =>
                    <MenuItem key={item.tokens.join()} value={item}>{item.tokens.join()}</MenuItem>
                  )}
                </Select>
              );
            }
        }
      case "Source":
        switch (annotators["Source"]) {
          case "Classes":
            return (
              <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleSrcSelection}>
                {sourceClasses.map((item) =>
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                )}
              </Select>
            );
          case "Audio":
            return (
              <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleSrcSelection}>
                {srcMentions.value.map((item) =>
                  <MenuItem key={item.join(" , ")} value={item}>{item.join(" , ")}</MenuItem>
                )}
              </Select>
            );
          default:
            if (srcAnnotateDirect == true) {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleSrcSelection}>
                  {srcMentions.value.map((item) =>
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  )}
                </Select>
              );
            } else {
              return (
                <Select value={"Empty"} style={{ minWidth: "200px" }} onChange={handleSrcSelection}>
                  {srcMentions.value.map((item) =>
                    <MenuItem key={item.tokens.join()} value={item}>{item.tokens.join()}</MenuItem>
                  )}
                </Select>
              );
            }
      case "Relation":
        return (
          <Select value={"Empty"} style={{ minWidth: "250px" }} onChange={handleRelSelection}>
            {relationClasses.map((item) =>
              <MenuItem key={item} value={item}>{item}</MenuItem>
            )}
          </Select>
        );
    }
  }

  function displaySelectedMention(object) {
    if (object.hasOwnProperty("tokens")) {
      return object.tokens.join()
    } else {
      return object
    }
  }

  useEffect(() => {
  }, [srcMentionsList, tgtMentionsList]);

  useEffect(() => {
    setSelectedSrc({ tokens: [""] })
    setSelectedTgt({ tokens: [""] })
    setSelectedRel("default")
  }, [annotatedTriples]);

  useEffect(() => {
    getRawData("getSource", annotators["Source"]);
    getRawData("getTarget", annotators["Target"]);

    // TODO: cant get 1st document annotations to rerender, fix it
    getExistingAnnotations("getSource")
    getExistingAnnotations("getTarget")
    getExistingAnnotations("getTriple")
  }, []);

  return (
    <Container style={{ maxWidth: '80%', marginBottom: '25px', padding: '30px' }}>
      {checkUser()}
      <Row style={{ justifyContent: "center", textAlign: "center" }}><strong>Project Name: {projectName}</strong></Row>
      {/* COMPONENT LEVEL ANNOTATIONS */}
      <Row>
        <Grid item xs={8}>
          <Grid className={classes.source}>
            <strong>Source</strong>
            {/* Check source task */}
            {renderSourceTask()}
          </Grid>
          <Grid className={classes.target}>
            <strong>Target</strong>
            {/* Check target task - if class annotator can skip */}
            {renderTargetTask()}
          </Grid>
        </Grid>

        <Grid className={classes.annotations} item xs={4}>
          <Row>
            <Grid item xs={8}>
              <h5>Annotations</h5>
            </Grid>
            <Grid item xs={4}>
              <Button className={classes.button} onClick={saveTriples}>Save to Datasets</Button>
            </Grid>
          </Row>
          {renderAnnotatedTriples()}
        </Grid>
      </Row>

      {/* TRIPLES ANNOTATIONS  */}
      <Row style={{ border: '1px solid black', backgroundColor: 'lightgray', padding: '10px' }}>
        <Col>
          <Row>
            <Grid className={classes.annotator} item xs={4}>
              <FormControl>
                <InputLabel>Source</InputLabel>
                {renderMentions("Source")}
              </FormControl>
            </Grid>
            <Grid className={classes.annotator} item xs={4}>
              <FormControl>
                <InputLabel>Relation</InputLabel>
                {renderMentions("Relation")}
              </FormControl>
            </Grid>
            <Grid className={classes.annotator} item xs={4}>
              <FormControl>
                <InputLabel>Target</InputLabel>
                {renderMentions("Target")}
              </FormControl>
            </Grid>
          </Row>
          <Row>
            <Grid className={classes.selectedoutput} item xs={4}>{displaySelectedMention(selectedSrc)}</Grid>
            <Grid className={classes.selectedoutput} item xs={4}>{selectedRel}</Grid>
            <Grid className={classes.selectedoutput} item xs={4}>{displaySelectedMention(selectedTgt)}</Grid>
          </Row>
          <Row>
            <Grid item xs={6}>
              <Link to={{ pathname: "/project", state: { projectname: projectName, user: userName } }}><Button className={classes.button}>Back</Button></Link>
            </Grid>
            <Grid item xs={6}>
              <Button className={classes.button} onClick={handleEnterButton}>Enter</Button>
            </Grid>
          </Row>
        </Col>
      </Row>
    </Container >
  );
}

