import React, {useEffect, useState, useRef} from 'react'; 

import { 
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap';


export default function TextBase({tokens, getSpan, onChange, value}) { 

  const display = useRef(tokens);
  const [spans, setSpans] = useState(new Array());
  const [startends, setStartEnds] = useState(new Array());

  function handleSelection(){
    // console.log(window.getSelection().toString());
    var highlight = window.getSelection();
    var range = highlight.getRangeAt(0);
    // var startOffset = range.startOffset;
    // var endOffset = range.endOffset;
    // var startText = range.startContainer.textContent;
    // var endText = range.endContainer.textContent;
    var startID = range.startContainer.parentElement.id
    var endID = range.endContainer.parentElement.id    
    var selectedSpan = tokens.slice(startID, endID)
    setSpans(oldlist => (
      [...oldlist, {'text': selectedSpan.join(' '), 'tokens': selectedSpan, 'start': startID, 'end': endID+1}]
    ));
    setStartEnds(oldlist => (
      [...oldlist, [startID, endID]]
    ));
  }

  // Array.prototype.splice.apply(newTokens, [start, span.tokens.length].concat(newTokens));

  function extractSpans(){

    var newTokens=JSON.parse(JSON.stringify(tokens));
    spans.forEach((span) => 
    {

      var start = span.start
      var end = span.end

      var newspanHead = <mark style={{backgroundColor: "lightblue"}} data-start={start} data-end={end}>{span.text}</mark>
      var newspanTail = ''

      for (var idx=start; idx<end; idx++){
            if (idx==start){
              newTokens[idx] = newspanHead;
            }else{
              newTokens[idx] = newspanTail;
            }
          }
      
    });
    newTokens = newTokens.filter(v=>v!='');
    //display.current=newTokens;
  }

  useEffect(() => {
    extractSpans()
    // remove spans from tokens and replace with objects then use toggletext
    console.log(spans)
  }, [spans]);

  useEffect(() => {
    console.log(spans)
  }, [tokens]);

  return(
    <Container onMouseUp={handleSelection}>
      {
        display.current.map((item, idx) => 
            <span id={idx}> { item } </span>
          )
      }  
    </Container>
  );
}   
