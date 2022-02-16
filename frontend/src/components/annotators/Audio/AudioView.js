import React, { useEffect, useState } from 'react';
import { Button, Container, Row } from 'react-bootstrap';
import { Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import RangeSlider from './rangeSlider';
import { textAlign } from '@mui/system';

export default function AudioView({ objURL, filename, mentions, setMentions, loadMentions, tokenIndex }) {

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
  const [state, setState] = useState(mentions);
  const [audio, setAudio] = useState(new Audio())

  var stepSize = 0.1
  var segmentEnd;

  audio.addEventListener('timeupdate', function () {
    if (segmentEnd && audio.currentTime >= segmentEnd) {
      audio.pause();
    }
    console.log(audio.currentTime);
  }, false);

  function audioPlay(startTime, endTime) {
    audio.currentTime = startTime;
    segmentEnd = endTime;
    audio.play()
  }

  function renderAudioPlayer() {
    return (
      <Container style={{ "backgroundColor": "#DEB887" }}>
        <Row className={classes.playerController}>
          <Grid item xs={4}>
            <Button className={classes.button} onClick={() => audio.pause()}>Pause</Button>
          </Grid>
          <Grid item xs={4}>
            <Button className={classes.button} onClick={() => audioPlay(0, 1)}>Play</Button>
          </Grid>
        </Row>
      </Container>
    );
  }

  useEffect(() => {
    setAudio(new Audio(objURL));
  }, [objURL]);

  useEffect(() => {
    setState(mentions)
  }, [tokenIndex]);

  useEffect(() => {
  }, [state.value]);

  return (
    <Container style={{ "margin": "5px", "minHeight": "150px", "padding": "5px" }}>
      {
        state.value.map((item) => <Row>{item[0]}</Row>)
      }
    </Container >
  );
}
