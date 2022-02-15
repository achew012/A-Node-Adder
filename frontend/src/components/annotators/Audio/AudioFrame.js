import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
      marginRight: 'auto'
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
    }
  });

  const classes = useStyles();
  const [time, setTime] = useState(Date.now())

  useEffect(() => {
    setMentionsList(mentionsList => ({ ...mentionsList, [tokenIndex]: { value: mentions.value } }));
    getDataSlice(annotatorType, audioList[tokenIndex])
  }, [audioList, tokenIndex]);

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

  // function renderAnnotator() {
  //   return (
  //     <AudioBase tokens={audioList[tokenIndex]} mentions={loadMentions()} setMentions={setMentions} tokenIndex={tokenIndex}></AudioBase>
  //   );
  // }

  function renderWave() {
    return (
      <AudioBase objURL={objURL}></AudioBase>
    );
  }

  useEffect(() => {
  }, [mentionsList, objURL]);

  return (
    <Container className={classes.main}>
      <Col>
        <Row className={classes.row}>
          <Grid item xs={4}><Button onClick={handlePrevIndex}>Prev</Button></Grid>
          <Grid item xs={4}>{tokenIndex} - {audioList[tokenIndex]}</Grid>
          <Grid item xs={2}><Button onClick={handleNextIndex}>Next</Button></Grid>
          <Grid item xs={2}><Button onClick={handleSaveMentions}>Save to Datasets</Button></Grid>
        </Row>
        <Row className={classes.row} style={{ backgroundColor: "lightblue" }}>
          <Grid item xs={12} className={classes.scrollable}>
            {renderWave()}
          </Grid>
        </Row>
      </Col>
    </Container>
  );
}
