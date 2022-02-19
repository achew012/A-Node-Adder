import React, { useEffect, useState } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import Input from '@mui/material/Input';
import { makeStyles } from '@mui/styles';

export default function TextCustom({ mentions, setMentions, mentionsList, setMentionsList }) {

  const useStyles = makeStyles({
    main: {
      backgroundColor: "lightblue",
      padding: '5px',
      minWidth: '95%',
      minHeight: '100px',
      Height: '98%',
      marginTop: '5px',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '0.9em',
    },
    textbox: {
      overflow: 'wrap',
      minWidth: '60%',
      minHeight: '50px',
    },
    button: {
      minWidth: '50px',
      marginLeft: '10px',
      marginRight: '10px',
      marginTop: '5px',
      marginBottom: '5px',
      padding: '5px',
      backgroundColor: 'gray',
      border: 'solid 2px gray',
      color: 'lightgreen',
      fontSize: '0.9em',
    }
  });
  const classes = useStyles();
  const [state, setState] = useState('');

  function handleMentionsAdd(event) {
    if ((mentions.value).includes(state) == false) {
      setMentions({ value: [...mentions.value, state] })
    }
  }

  useEffect(() => {
    setMentionsList(mentionsList => ({ ...mentionsList, [0]: mentions }));
  }, [mentions]);

  return (
    <Container className={classes.main}>
      {/* Text Input Coming Soon... */}
      <Input className={classes.textbox} onChange={(event) => setState(event.target.value)} placeholder={'Add Your Own Caption'}></Input>
      <Button className={classes.button} onClick={handleMentionsAdd}>Add</Button>
    </Container>);
}
