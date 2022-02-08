import axios from 'axios';  
import React,{Component, useEffect, useState, useRef} from 'react'; 
import { 
  Container,
  Button
} from 'react-bootstrap';

export default function RelationAnnotator({tokens, nodes, addRel2List}) { 
    
    const relation = useRef([]);
    const sourceTargetRel = useRef([]); //index between source-target relations

    function extractSelectedNodes(tokens, nodes){
      var count=0;
      var nodedict={};
      var newTokens=JSON.parse(JSON.stringify(tokens)); // Deep copy

      nodes.forEach(item => {
        var start = item.start;
        var end = item.end;   
        var phrase_head = '$PH_'+count+'$';    
        var phrase_tail = '';    

        for (var idx=start; idx<end; idx++){
          if (idx==start){
            newTokens[idx] = phrase_head;
          }else{
            newTokens[idx] = phrase_tail;
          }
        }
        var new_token = (item.tokens).join(' ');
        nodedict[phrase_head]={'text': new_token, 'class': item.tag, 'idx': [item.start, item.end]};
        count++;
      });
      newTokens = newTokens.filter(v=>v!='');
      return [newTokens, nodedict];
    }

    function handleSubmit(e){
      const selectedRelations = nodedict[e.target.value]
      const indexRel = nodes.value.findIndex(x => x.tag === selectedRelations.class)
      if (relation.current.length<2){    
        relation.current.push(selectedRelations);
        sourceTargetRel.current.push(indexRel)
      }
      if (relation.current.length==2){
        results = addRel2List(relation.current, sourceTargetRel.current);
        sourceTargetRel.current=[];
        relation.current=[];
      }
    }

    function toggleText(item){      
      if (nodedict.hasOwnProperty(item)){
        return(
        <Button onClick={handleSubmit} value={item} key={Math.random()} style={{ margin: '1px', padding: '1px'}}>
          {nodedict[item].text}
        </Button>
        );
      } else {
        return(' '+item+' ');
      }
    }

    var results = extractSelectedNodes(tokens, nodes.value);
    var newTokens = results[0];
    var nodedict = results[1];

    return ( 
        <Container style={{ margin: '20px', textAlign: 'justify', maxWidth: 800, lineHeight: 1.5}}>
            {newTokens.map((item) =>
                toggleText(item)
              )}
        </Container>
      );
  }   




