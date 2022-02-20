import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { Container, Row, Button, Col } from 'react-bootstrap';
import AudioBase from './AudioBase';
import AudioView from './AudioView'
import AudioCustom from './AudioCustom';

// mentions only manages current highlighted selections 
// mentionsList caches selections every index change
export default function AudioFrame({ tokenIndex, setTokenIndex, audioList, mentions, setMentions, saveMentions, mentionsList, setMentionsList, annotatorType, getDataSlice, objURL, AnnotateDirect }) {

  const useStyles = makeStyles({
    main: {
      backgroundColor: "lightgray",
      padding: '5px',
      minWidth: '95%',
      Height: '98%',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '0.9em'
    },
    row: {
      Height: '95%',
      maxWidth: '95%',
      marginTop: '10px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    scrollable: {
      overflow: 'scroll',
      maxHeight: '400px'
    },
    button: {
      minWidth: '50px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '5px',
      marginBottom: '5px',
      padding: '5px',
      backgroundColor: 'gray',
      border: 'solid 2px gray',
      color: 'lightgreen',
      fontSize: '0.9em',
    },

  });

  const classes = useStyles();
  const [selectedRange, setSelectedRange] = useState([0, 0.1])

  useEffect(() => {
    setMentionsList(mentionsList => ({ ...mentionsList, [audioList[tokenIndex]]: { value: mentions.value } }));
    getDataSlice(annotatorType, audioList[tokenIndex])
  }, [audioList, tokenIndex, selectedRange]);

  useEffect(() => {
    // console.log(mentionsList, objURL)
  }, [mentionsList, objURL]);

  function handleNextIndex(e) {
    e.preventDefault();
    setTokenIndex((tokenIndex + 1) % audioList.length);
  }

  function handlePrevIndex(e) {
    e.preventDefault();
    setTokenIndex((tokenIndex + audioList.length - 1) % audioList.length);
  }

  function handleSaveMentions() {
    var mentionsToSave = { ...mentionsList, [audioList[tokenIndex]]: { value: mentions.value } }
    saveMentions(annotatorType, mentionsToSave);
  }

  // takes from mentionsList(updated every index change) any existing annotations else sets mentions to be empty
  function loadMentions() {
    if (mentionsList.hasOwnProperty(audioList[tokenIndex])) {
      return (mentionsList[audioList[tokenIndex]]);
    } else {
      return ({ value: [] });
    }
  }

  function renderMediaPlayer() {
    if (AnnotateDirect == true) {
      return (
        <Container>
          {/* Audio Recorder Coming Soon... */}
          <AudioCustom></AudioCustom>
        </Container>);
    } else {
      return (
        <AudioBase objURL={objURL} filename={audioList[tokenIndex]} selectedRange={selectedRange} setSelectedRange={setSelectedRange} mentions={loadMentions()} setMentions={setMentions} tokenIndex={tokenIndex}></AudioBase >
      );
    }
  }

  function renderAnnotatedAudio() {
    return (<AudioView objURL={objURL} filename={audioList[tokenIndex]} mentions={loadMentions()} setMentions={setMentions} tokenIndex={tokenIndex}></AudioView>);
  }

  return (
    <Container className={classes.main}>
      <Col>
        <Row className={classes.row}>
          <Grid item xs={4}><Button className={classes.button} onClick={handlePrevIndex}>Prev</Button></Grid>
          <Grid item xs={4}>{tokenIndex} - {audioList[tokenIndex]}</Grid>
          <Grid item xs={2}><Button className={classes.button} onClick={handleNextIndex}>Next</Button></Grid>
          <Grid item xs={2}><Button className={classes.button} onClick={handleSaveMentions}>Save to Datasets</Button></Grid>
        </Row>
        <Row className={classes.row} style={{ backgroundColor: "lightblue" }}>
          <Grid item xs={6} className={classes.scrollable}>
            {renderMediaPlayer()}
          </Grid>
          <Grid item xs={6} className={classes.scrollable}>
            {renderAnnotatedAudio()}
          </Grid>
        </Row>
      </Col>
    </Container>
  );
}
