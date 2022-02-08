import React, {useEffect, useState} from 'react'; 

import {TokenAnnotator, TextAnnotator} from 'react-text-annotate'
// import TokenAnnotator from '../old/TokenAnnotator'

export default function TextBase({tokens, mentions, setMentions, tokenIndex}) { 

  const [state, setState] = useState(mentions);

  useEffect(() => {
    setState(mentions);
  }, [tokenIndex]);

  useEffect(() => {
    setMentions({value: state.value});
  }, [state.value]);  

  return (
    <TokenAnnotator
      style={{
        textAlign: 'justify',
        maxWidth: 800,
        lineHeight: 1.5,
        margin: '20px',
      }}
      tokens={tokens}
      value={state.value}
      onChange={value => setState({ value })}
      // appends the span/node to state.value list along with the corresponding class
      getSpan={span => ({
        ...span,
        // tag: nodeClass,
        color: "lightpink",
      })}
    />
  );
  }   
