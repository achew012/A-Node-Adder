import axios from 'axios';  
import React,{Component, useEffect, useState} from 'react'; 
import { 
  Container,
  Row,
} from 'react-bootstrap';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link
} from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export default function AnnotatorManager() { 
  const SERVER_URL = process.env.REACT_APP_SERVER_URL  
  const useStyles = makeStyles({
      table: {
          minWidth: 300,
      },
      projectItem: {
        border: '1px solid lightgray',
        margin: '20px',
        fontSize:  '0.9em',
        padding: '20px',
        overflowWrap: 'break-word',
        textAlign: 'center',
      },
    });

    const classes = useStyles();
    
    const [annotatorCode, setAnnotatorCode] = useState('')
    const [annotatorList, setAnnotators] = useState([''])
    const [display, setDisplay] = useState([''])

    function handleNameChange(e) {
      e.preventDefault();
      setAnnotatorCode(e.target.value);
    }

    function handleAnnotatorCreate(e) {
      e.preventDefault();
      console.log(annotatorCode);
      const valueHolder = {
        type: 'create',
        annotator_code: annotatorCode,
      };
      submit(valueHolder);
    }

    function handleAnnotatorDelete(e) {
      e.preventDefault();
      console.log(annotatorCode);
      const valueHolder = {
        type: 'delete',
        annotator_code: annotatorCode,
      };
      submit(valueHolder);
    }

    function submit(valueHolder){
        axios.post('http://'+SERVER_URL+'/projectslist', { valueHolder }).then(res => {
        console.log(res.data);
        var result = res.data
        setAnnotators(result);
      });    
    }

    function getAnnotators(){
      const valueHolder = {
        type: 'list',
        annotator_code: null,
      };
      // submit(valueHolder);
      setAnnotators(['text', 'img', 'audio', 'classes'])
    }

    useEffect(() => {
      getAnnotators();
    }, []);

    return ( 
        <Container>
          <Row style={{ padding: '0px', height: '100px' }}>                    
            <h3 style={{ marginLeft: '15px' }}> 
              Manage Annotators 
            </h3>      
          </Row>
            <Row>          
              <form>
                <label style={{ margin: '10px' }}>Annotator Code</label>
                <input onChange={handleNameChange} style={{ margin: '10px' }}></input>
                <button type='submit' onClick={handleAnnotatorCreate} style={{ margin: '10px' }}>Create</button>
                <button type='submit' onClick={handleAnnotatorDelete} style={{ margin: '10px' }}>Delete</button>
              </form> 
            </Row>
          <Row style={{marginTop: '20px'}}>
            <Table>
              <TableBody>
                {annotatorList.map((item) =>
                  <TableRow key={Math.random()}>
                    <TableCell className={classes.projectItem}>
                      {item}
                    </TableCell>
                    <TableCell className={classes.projectItem}>
                      <Link  to={{pathname: "/annotator", state: {annotatorcode: item}}} className={classes.btn}>Manage</Link>
                    </TableCell>
                  </TableRow>
                )}                
              </TableBody>
            </Table>
          </Row>
        </Container>
      );
  }   