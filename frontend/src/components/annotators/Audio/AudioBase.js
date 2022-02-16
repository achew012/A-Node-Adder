import React, { useEffect, useState } from 'react';
import { Button, Container, Row } from 'react-bootstrap';
import { Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import RangeSlider from './rangeSlider';
import { textAlign } from '@mui/system';

export default function AudioBase({ objURL, filename, selectedRange, setSelectedRange, mentions, setMentions, tokenIndex }) {

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
    playerController: {
      Height: '99%',
      maxWidth: '99%',
      marginTop: '10px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    player: {
      Height: '99%',
      maxWidth: '99%',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center'
    },
    scrollable: {
      overflow: 'scroll',
      maxHeight: '400px'
    },
    button: {
      minWidth: '50px',
      marginLeft: '5px',
      marginRight: '5px',
      marginTop: '5px',
      marginBottom: '5px',
      padding: '5px',
      backgroundColor: '#00008B',
      border: 'solid 2px #00008B',
      color: 'lightgreen',
      fontSize: '0.9em',
    },

  });

  const classes = useStyles();
  let ref = null;
  const [audio, setAudio] = useState(new Audio())
  const [time, setTime] = useState(Date.now())
  var stepSize = 0.1
  var segmentEnd;

  function isUnique(entry) {
    var testArray = mentions.value.map((item) => item.join() == entry.join())
    console.log(testArray)
    if (testArray.includes(true)) {
      return false;
    } else {
      return true;
    }
  }

  function handleAddMentions() {
    if (isNaN(selectedRange[1]) == false && isUnique([filename, selectedRange])) {
      setMentions({ value: [...(mentions.value), [filename, selectedRange]] });
    }
  }

  audio.addEventListener('timeupdate', function () {
    if (segmentEnd && audio.currentTime >= segmentEnd) {
      audio.pause();
    }
  }, false);

  audio.onloadeddata = function () {
    setSelectedRange([0, audio.duration])
  }

  function audioPlay(startTime, endTime) {
    audio.currentTime = startTime;
    segmentEnd = endTime - stepSize;
    audio.play()
  }

  function renderAudioPlayer() {
    return (
      <Container style={{ "backgroundColor": "#DEB887" }}>
        <Row className={classes.player}>
          <Grid item xs={4}>
          </Grid>
          <Grid item xs={4}>
            <h5>Adjust me!</h5>
          </Grid>
          <Grid item xs={4}>
          </Grid>
          <RangeSlider maxRange={audio.duration} selectedRange={selectedRange} stepSize={stepSize} setSelectedRange={setSelectedRange}></RangeSlider>
        </Row>
        <Row>
          <Grid item xs={4}>
            Start
          </Grid>
          <Grid item xs={4}>
          </Grid>
          <Grid item xs={4}>
            End
          </Grid>
        </Row>
        <Row className={classes.playerController}>
          <Grid item xs={4}>
            <Button className={classes.button} onClick={() => audio.pause()}>Pause</Button>
          </Grid>
          <Grid item xs={4}>
            <Button className={classes.button} onClick={() => audioPlay(selectedRange[0], selectedRange[1])}>Play</Button>
          </Grid>
          <Grid item xs={4}>
            <Button className={classes.button} onClick={handleAddMentions}>Add</Button>
          </Grid>
        </Row>
      </Container>
    );
  }

  useEffect(() => {
    setAudio(new Audio(objURL));
  }, [objURL]);

  useEffect(() => {
  }, [mentions, selectedRange]);

  useEffect(() => {
    setMentions({ value: [] })
  }, [tokenIndex]);

  return (
    <Container style={{ "margin": "5px", "minHeight": "150px", "padding": "5px" }}>
      <Row style={{ "margin": "15px", "padding": "20px" }}>
        <Grid item xs={12}>
          <Row>
            {renderAudioPlayer()}
          </Row>
          <Row>
          </Row>
        </Grid>
      </Row>
    </Container >
  );
}
