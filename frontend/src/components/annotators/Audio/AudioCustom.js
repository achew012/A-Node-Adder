import React, { useEffect, useState } from 'react';
import { Button, Container, Row } from 'react-bootstrap';
import { Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'

export default function AudioCustom() {

  const useStyles = makeStyles({
    main: {
      backgroundColor: "#DEB887",
      padding: '5px',
      minWidth: '300%',
      minHeight: '100px',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '0.9em'
    },

    button: {
      ":disabled": {
        backgroundColor: "white",
        color: "white"
      },
      minWidth: '50px',
      marginLeft: '5px',
      marginRight: '5px',
      marginTop: '5px',
      marginBottom: '5px',
      padding: '5px',
      backgroundColor: 'gray',
      border: 'solid 2px gray',
      color: 'lightgreen',
      fontSize: '0.9em',

    }

    // button: {
    //   minWidth: '50px',
    //   marginLeft: '5px',
    //   marginRight: '5px',
    //   marginTop: '5px',
    //   marginBottom: '5px',
    //   padding: '5px',
    //   backgroundColor: 'gray',
    //   border: 'solid 2px gray',
    //   color: 'lightgreen',
    //   fontSize: '0.9em',
    // },

  });

  const classes = useStyles();
  const [recordState, setRecordState] = useState(RecordState)
  const [audio, setAudio] = useState(null)

  function onStop(audioData) {
    setAudio(audioData)
  }

  function handleRecordStart() {
    setRecordState(RecordState.START)
  }

  function handleRecordStop() {
    setRecordState(RecordState.STOP)
  }

  function handlePlayAudio() {
    const stream = new Audio(audio.url)
    stream.play()
  }

  function addRecording() {
    console.log(audio)
    setAudio(null)
  }

  function renderPlayButton() {
    if (audio != null) {
      return (
        <Grid>
          <Button variant="contained" className={classes.button} onClick={handlePlayAudio}> Play </Button>
          <Button variant="contained" className={classes.button} onClick={addRecording}> Add </Button>
          <Button variant="contained" className={classes.button} onClick={(event) => setAudio(null)}> Reset </Button>
        </Grid>
      );
    } else {
      return (<Button disabled className={classes.button}> Play </Button>);
    }
  }

  useEffect(() => {
    console.log('audioData', audio)
  }, [audio]);

  return (
    <Container>
      <Row className="justify-content-center">
        <Grid>
          <AudioReactRecorder className={classes.main} canvasWidth="300px" canvasHeight="100px" state={recordState} backgroundColor="black" foregroundColor="lightgreen" onStop={onStop} />
        </Grid>
      </Row>
      <Row className="justify-content-center">
        <Grid>
          <Button variant="contained" className={classes.button} onClick={handleRecordStart}>Record</Button>
          <Button variant="contained" className={classes.button} onClick={handleRecordStop}>Stop Recording</Button>
        </Grid>
        {renderPlayButton()}
      </Row>
    </Container >
  );
}
