import React, {useEffect, useState} from 'react'; 
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Row, Button, Col } from 'react-bootstrap';

import TextBase from './TextBase';


// mentions only manages current highlighted selections 
// mentionsList caches selections every index change
export default function TextFrame({tokenIndex, setTokenIndex, tokensList, mentions, setMentions, saveMentions, mentionsList, setMentionsList, annotatorType}) { 

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

  function handleNextIndex(e) {
    e.preventDefault();
    setMentionsList(mentionsList => ({...mentionsList, [tokenIndex]: {value: mentions.value}}));
    if (tokenIndex+1<tokensList.length){
      setTokenIndex(tokenIndex+1)
    }else{
      setTokenIndex(0)
    }
  }

  function handlePrevIndex(e) {
    e.preventDefault();
    setMentionsList(mentionsList => ({...mentionsList, [tokenIndex]: {value: mentions.value}}));    
    if (tokenIndex-1>=0){
      setTokenIndex(tokenIndex-1)
    }else{
      setTokenIndex(tokensList.length - 1)
    }
  }

  function handleSaveMentions(){
    var mentionsToSave = {...mentionsList, [tokenIndex]: {value: mentions.value}}
    saveMentions(annotatorType, mentionsToSave);
  }

  // takes from mentionsList(updated every index change) any existing annotations else sets mentions to be empty
  function loadMentions(){
    if (mentionsList.hasOwnProperty(tokenIndex)){
      return(mentionsList[tokenIndex]);
    } else{
      return({value: []}); 
    }
  }

  useEffect(() => {
  }, [mentionsList]);

  return (
    <Container className={classes.main}>
      <Col>
        <Row className={classes.row}>
          <Grid item xs={4}><Button onClick={handlePrevIndex}>Prev</Button></Grid>
          <Grid item xs={4}>Document {tokenIndex}</Grid>
          <Grid item xs={2}><Button onClick={handleNextIndex}>Next</Button></Grid>
          <Grid item xs={2}><Button onClick={handleSaveMentions}>Save to Datasets</Button></Grid>
        </Row>
        <Row className={classes.row} style={{backgroundColor: "lightblue"}}>
          <Grid item xs={12} className={classes.scrollable}>        
            <TextBase tokens={tokensList[tokenIndex]} mentions={loadMentions()} setMentions={setMentions} tokenIndex={tokenIndex}></TextBase>
          </Grid>
        </Row>
      </Col>
    </Container>
    );
  }   
