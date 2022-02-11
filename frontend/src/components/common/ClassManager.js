import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';

export default function ClassManager({ selectedClasses, setClasses, type }) {

  const useStyles = makeStyles({
    inputCont: {
      Width: '90%',
      margin: '5px',
      padding: '5px',
      fontSize: '0.95em'
    },

    button: {
      margin: '1px',
      padding: '5px',
      minWidth: '35px',
      maxHeight: '35px',
      backgroundColor: 'lightgray',
      border: 'solid 1px darkgreen',
      color: 'black',
      fontSize: '1em',
    }
  });
  const classes = useStyles();
  const [classNameInput, setClassNameInput] = useState('');
  const [time, setTime] = useState(Date.now());
  const classList = selectedClasses[type]

  function handleClassAdd() {
    if (classNameInput != '') {
      const newClassList = selectedClasses
      newClassList[type] = [...new Set([...newClassList[type], classNameInput])]
      setClasses(newClassList)
      setTime(Date.now())
    }
  }

  function handleClassDelete(event) {
    var item = event.target.value;
    const newClassList = selectedClasses;
    newClassList[type] = newClassList[type].filter(v => v != item);
    setClasses(newClassList);
    setTime(Date.now())
  }

  function displayClasses() {
    if (selectedClasses[type] != null) {
      return (
        <Container>
          {
            selectedClasses[type].map((item) =>
              <Col key={item}>
                <Button className={classes.button} onClick={handleClassDelete} value={item}>{item}</Button>
              </Col>
            )
          }
        </Container>
      );
    }
  }

  useEffect(() => {
  }, [time]);

  return (
    <Container className={classes.inputCont}>
      <Row>
        <Col>
          <Input className={classes.inputCont} onChange={(event) => setClassNameInput(event.target.value)} placeholder={'Enter Classname'}></Input>
          <Button className={classes.button} onClick={handleClassAdd} style={{ backgroundColor: 'gray' }}>Add</Button>
        </Col>
        <Col>
          {displayClasses()}
        </Col>
      </Row>
    </Container>
  );
}