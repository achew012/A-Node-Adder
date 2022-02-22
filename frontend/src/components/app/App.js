import React from 'react';
import '../../scss/App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import Homepage from '../common/Homepage';
import Header from '../common/Header';
import ProjectManager from '../common/ProjectManager';
import Project from '../common/Project';
// import AnnotatorManager from '../common/AnnotatorManager';
import Annotate from '../common/Annotate';

function App() {
    return (
        <div className="App">
            <Router>
                <Header />
                <Switch>
                    <Route exact path="/" component={Homepage} />
                    {/* <Route exact path="/annotators" component={AnnotatorManager}/> */}
                    {/* <Route exact path="/upload" component={Upload}/> */}
                    <Route exact path="/projects" component={ProjectManager} />
                    <Route exact path="/project" component={Project} />
                    <Route exact path="/annotate" component={Annotate} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
