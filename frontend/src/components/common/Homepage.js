import axios from 'axios';  
import React, {useEffect, useState} from 'react'; 

import { 
    Container,
    Row,
    Col,
    Button, 
} from 'react-bootstrap';

import {
    Redirect,
} from 'react-router-dom';

require('dotenv').config();

var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(0);

export default function Homepage() {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('login');

    const headers = {
        'Access-Control-Allow-Origin': "*",
    }

    function submit(valueHolder){        
        axios.post("http://"+SERVER_URL+"/login", { valueHolder }, {
            headers: headers
          }).then(res => {
        var result = res.data['answer']
        if (result=='login success'){
            setState('projects');
        }else if (result=='create success'){
            alert('Account Created')
        }else{
            alert('Credentials Failure')
        }
      });    
    }
    

    function handleLogin(){
        if (userName!='' | password!=''){
            console.log(userName)

            const valueHolder = {
                type: 'login',
                user: userName,
                hash: bcrypt.hashSync(password,salt),
              };
              submit(valueHolder);
        }else{
            alert('Login Details Incomplete')
        }
    }

    function handleCreate(){
        if (userName!='' | password!=''){
            console.log(userName)

            const valueHolder = {
                type: 'create',
                user: userName,
                hash: bcrypt.hashSync(password,salt),
              };
              submit(valueHolder);
        }else{
            alert('Login Details Incomplete')
        }
    }

    function updateUser(event){
        setUserName(event.target.value);
    }

    function updatePassword(event){
        setPassword(event.target.value);
    }

    function displayLogin(){
        if (state=='login'){
            return (
                <Container>
                    <Row style={{margin: '10px'}}>
                        <Col>
                            <label style={{margin: '10px'}}>User: </label>
                        </Col>
                        <Col>
                            <input onChange={updateUser} style={{margin: '10px'}}></input>
                        </Col>
                    </Row>
                    <Row style={{margin: '10px'}}>
                        <Col>
                            <label style={{margin: '10px'}}>Password:</label>
                        </Col>
                        <Col>
                            <form>
                                <input onChange={updatePassword} type="password" style={{margin: '10px'}}></input>
                            </form>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button style={{margin: '10px'}} onClick={handleLogin}>Login</Button>                
                            <Button style={{margin: '10px'}} onClick={handleCreate}>Create</Button>
                        </Col>                
                    </Row>                    
                </Container>
            );    
        }else{
            console.log('redirecting to projects')
            return(
                <Redirect
                to={{
                    pathname: "/projects",
                    state: { user: userName }
                }}
                />
            );
        }
    }
    return(
        <Container>
            {/* <Row>
                <Col><img src={wallpaper} id="wallpaper_img" alt="wallpaper"></img></Col>
            </Row> */}
            <Row>
                <Col></Col>   
                <Col xs={8}><h1>The Ultimate Document Annotator</h1></Col>
                <Col></Col>
            </Row>
            {displayLogin()}
       </Container>
    )
}

