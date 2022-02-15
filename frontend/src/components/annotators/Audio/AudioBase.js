import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

export default function AudioBase({ objURL }) {

  let ref = null;

  useEffect(() => {
    ref.load()
  }, [objURL]);

  return (
    <Container>
      <audio ref={(el)=> {ref = el} } controls>
        <source src={objURL} type="audio/wav"></source>
      </audio>
    </Container>
  );
}
