import React from 'react';

import { Link } from 'react-router-dom';

import {
    Container,
    Nav,
    Navbar,
    NavDropdown
} from 'react-bootstrap';

export default function Header() {

    return(
    <Navbar bg="light" expand="lg">
        <Container>
            <Navbar.Brand as={Link} to="/">A-Node-Adder</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            {/* <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/projects">Manage Project</Nav.Link>
                </Nav>
            </Navbar.Collapse> */}
        </Container>
    </Navbar>
    )
}
