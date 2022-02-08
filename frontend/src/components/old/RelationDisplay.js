import axios from 'axios';  
import React,{Component, useEffect, useState, useRef} from 'react'; 
import { 
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

export default function RelationDisplay({showRelations, relationsList}) {
  
  const useStyles = makeStyles({
    scrollable: {
      maxHeight: '150px',
      border: 'solid 1px black',
      overflowX: 'hidden',
      overflowY: 'auto',
      padding: '0px',
    },
    button:{
      marginLeft: '5px',
      color: 'red',
    },
    tablecell: {
      textAlign: 'center',
      border: 'solid 1px black',
      fontSize:  '0.65em',
      padding: '0px',
      overflowWrap: 'break-word',
      minWidth: '30px',
    },
  });

  const classes = useStyles();
  const [time, setTime] = useState(Date.now());

  function handleDelete(e){
    var temp = relationsList.current
    temp.splice(e.target.value, 1);
    relationsList.current = temp;
    setTime(Date.now());
  }

  useEffect(() => {
    // console.log(selectedClass.current);
    // console.log(selectedRel.current);
  }, [time]);

  function toggleRelDisplay(){
    if (showRelations==true){
      return(
      <Container className={classes.scrollable}>
        <Table>
          <TableBody>
          <TableRow>
            <TableCell className={classes.tablecell}>Index</TableCell>
            <TableCell className={classes.tablecell}>Source</TableCell>
            <TableCell className={classes.tablecell}>Target</TableCell>
            <TableCell className={classes.tablecell}>Class</TableCell>
          </TableRow>
          {
            relationsList.current.map((item, index) =>
              <TableRow>
                <TableCell className={classes.tablecell}>
                  {index+1}
                </TableCell>
                <TableCell className={classes.tablecell}>
                  {item[2][0].text}
                </TableCell>
                <TableCell className={classes.tablecell}>
                  {item[2][1].text}
                </TableCell>
                <TableCell className={classes.tablecell}>                
                  {item[0]}
                </TableCell>
                <TableCell>
                  <button className={classes.button} value={index} onClick={handleDelete}>X</button>
                </TableCell>
              </TableRow>
            )
          }            
          </TableBody>
        </Table>
      </Container> 
      );
    }else{
      return(<Table></Table>);
    }  
  }

    return (
        toggleRelDisplay()
      );
  }   




