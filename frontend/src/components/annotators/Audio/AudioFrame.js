import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { Container, Row, Button, Col } from 'react-bootstrap';
import AudioBase from './AudioBase';


// mentions only manages current highlighted selections 
// mentionsList caches selections every index change
export default function AudioFrame({ tokenIndex, setTokenIndex, audioList, mentions, setMentions, saveMentions, mentionsList, setMentionsList, annotatorType, getDataSlice, objURL }) {

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
      Height: '99%',
      maxWidth: '99%',
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
  const [time, setTime] = useState(Date.now())

  useEffect(() => {
    setMentionsList(mentionsList => ({ ...mentionsList, [tokenIndex]: { value: mentions.value } }));
    getDataSlice(annotatorType, audioList[tokenIndex])
  }, [audioList, tokenIndex]);

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
    var mentionsToSave = { ...mentionsList, [tokenIndex]: { value: mentions.value } }
    saveMentions(annotatorType, mentionsToSave);
  }

  // takes from mentionsList(updated every index change) any existing annotations else sets mentions to be empty
  function loadMentions() {
    if (mentionsList.hasOwnProperty(tokenIndex)) {
      return (mentionsList[tokenIndex]);
    } else {
      return ({ value: [] });
    }
  }

  function renderMediaPlayer() {
    return (
      <AudioBase objURL={objURL} filename={audioList[tokenIndex]} selectedRange={selectedRange} setSelectedRange={setSelectedRange} mentions={mentions} setMentions={setMentions} tokenIndex={tokenIndex} loadMentions={loadMentions}></AudioBase >
    );
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
          <Grid item xs={12} className={classes.scrollable}>
            {renderMediaPlayer()}
          </Grid>
        </Row>
      </Col>
    </Container>
  );
}
