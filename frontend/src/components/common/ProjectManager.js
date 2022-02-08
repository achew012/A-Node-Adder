import axios from 'axios';  
import React,{Component, useEffect, useState} from 'react'; 
import { 
  Container,
  Row,
} from 'react-bootstrap';

import {
  BrowserRouter as Router,
  useLocation,
  Link,
  Redirect,
} from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export default function ProjectManager() { 
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
    const location = useLocation();
    const userName = location.state.user; 

    const [projectName, setprojectName] = useState('')
    const [projectList, setProjects] = useState([''])
    const [display, setDisplay] = useState([''])

    function checkUser(){
      if (userName==null){
        return(<Redirect
                  to={{
                      pathname: "/",
                  }}
                  />);
      }  
    }

    function handleNameChange(e) {
      e.preventDefault();
      setprojectName(e.target.value);
    }

    function handleProjectCreate(e) {
      e.preventDefault();
      console.log(projectName);
      const valueHolder = {
        type: 'create',
        project_name: projectName,
        user: userName,
      };
      if (projectName!=null){
        submit(valueHolder);
      }else{
        alert('No project selected')
      }
    }

    function handleProjectDelete(e) {
      e.preventDefault();
      console.log(projectName);
      const valueHolder = {
        type: 'delete',
        project_name: projectName,
      };
      if (projectName!=null){
        submit(valueHolder);
      }else{
        alert('No project selected')
      }
    }

    function submit(valueHolder){
        axios.post('http://'+SERVER_URL+'/projectslist', { valueHolder }).then(res => {
        console.log(res.data);
        var result = res.data['answer']
        setProjects(result);
      });    
    }

    function getProject(){
      const valueHolder = {
        type: 'listprojects',
        project_name: null,
      };      
      submit(valueHolder);
    }

    useEffect(() => {
      getProject();
    }, []);

    useEffect(() => {
    }, [projectList]);

    return ( 
        <Container>
          {checkUser()}
          <Row style={{ padding: '0px', height: '100px' }}>                    
            <h3 style={{ marginLeft: '15px' }}> 
              Manage Projects 
            </h3>      
          </Row>
            <Row>          
              <form>
                <label style={{ margin: '10px' }}>Project Name</label>
                <input onChange={handleNameChange} style={{ margin: '10px' }}></input>
                <button type='submit' onClick={handleProjectCreate} style={{ margin: '10px' }}>Create</button>
                <button type='submit' onClick={handleProjectDelete} style={{ margin: '10px' }}>Delete</button>
              </form> 
            </Row>
          <Row style={{marginTop: '20px'}}>
            <Table>
              <TableBody>
                {projectList.map((item) =>
                  <TableRow key={Math.random()}>
                    <TableCell className={classes.projectItem}>
                      {item}
                    </TableCell>
                    <TableCell className={classes.projectItem}>
                      <Link  to={{pathname: "/project", state: {projectname: item, user: userName }}} className={classes.btn}>Manage</Link>
                    </TableCell>
                  </TableRow>
                )}                
              </TableBody>
            </Table>
          </Row>
        </Container>
      );
  }   