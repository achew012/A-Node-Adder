import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Container, Row, Button, Col } from 'react-bootstrap';
import TextBase from './TextBase';
import TextCustom from './TextCustom';

// mentions only manages current highlighted selections 
// mentionsList caches selections every index change
export default function TextFrame({ tokenIndex, setTokenIndex, tokensList, mentions, setMentions, saveMentions, mentionsList, setMentionsList, annotatorType, AnnotateDirect }) {

  const useStyles = makeStyles({
    main: {
      backgroundColor: "lightgray",
      padding: '5px',
      minWidth: '95%',
      minHeight: '200px',
      Height: '98%',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '0.9em'
    },
    row: {
      Height: '99%',
      maxWidth: '99%',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
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
  const [time, setTime] = useState(Date.now())

  function handleNextIndex(e) {
    e.preventDefault();
    setMentionsList(mentionsList => ({ ...mentionsList, [tokenIndex]: { value: mentions.value } }));
    if (tokenIndex + 1 < tokensList.length) {
      setTokenIndex(tokenIndex + 1)
    } else {
      setTokenIndex(0)
    }
  }

  function handlePrevIndex(e) {
    e.preventDefault();
    setMentionsList(mentionsList => ({ ...mentionsList, [tokenIndex]: { value: mentions.value } }));
    if (tokenIndex - 1 >= 0) {
      setTokenIndex(tokenIndex - 1)
    } else {
      setTokenIndex(tokensList.length - 1)
    }
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

  function renderAnnotator() {
    if (AnnotateDirect == true) {
      return (
        <TextCustom mentions={loadMentions()} setMentions={setMentions} mentionsList={mentionsList} setMentionsList={setMentionsList} ></TextCustom >
      );
    } else {
      return (
        <TextBase tokens={tokensList[tokenIndex]} mentions={loadMentions()} setMentions={setMentions} tokenIndex={tokenIndex}></TextBase>
      );
    }
  }

  useEffect(() => {
    console.log(mentionsList)
  }, [mentionsList]);

  return (
    <Container className={classes.main}>
      <Col>
        <Row className={classes.row}>
          <Grid item xs={4}><Button className={classes.button} onClick={handlePrevIndex}>Prev</Button></Grid>
          <Grid item xs={4}>
            <Grid>
              Document {tokenIndex}
            </Grid>
            <Grid>
              Highlight Me!
            </Grid>
          </Grid>
          <Grid item xs={2}><Button className={classes.button} onClick={handleNextIndex}>Next</Button></Grid>
          <Grid item xs={2}><Button className={classes.button} onClick={handleSaveMentions}>Save to Datasets</Button></Grid>
        </Row>
        <Row className={classes.row} style={{ backgroundColor: "lightblue" }}>
          <Grid item xs={12} className={classes.scrollable}>
            {renderAnnotator()}
          </Grid>
        </Row>
      </Col>
    </Container>
  );
}
