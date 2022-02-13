import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

export default function AudioBase({ objURL }) {

  useEffect(() => {
  }, [objURL]);

  return (
    <Container>
      <audio controls>
        <source src={objURL} type="audio/wav"></source>
      </audio>
    </Container>
  );
}
