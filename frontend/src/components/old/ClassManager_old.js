import axios from 'axios';  
import React,{Component, useEffect, useState } from 'react'; 
import { 
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';

import ClassManagerDisplay from './ClassManagerDisplay';

export default function ClassManager({annotatorsDict, projectName}) {     
  return ( 
    <Container>
      {
      Object.keys(annotatorsDict).map((key, item)=>
        <Row style={{ margin: '20px'}}>
          <ClassManagerDisplay annotatorsDict={annotatorsDict} annotatorCode={key} projectName={projectName}></ClassManagerDisplay>
        </Row>
        )
      }
    </Container>);
}   