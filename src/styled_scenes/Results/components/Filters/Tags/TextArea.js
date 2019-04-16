import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { textLight, primary, primaryDisabled } from 'libs/colors';

function search(items, text) {
  return items.filter(function(item) {
    return text.split(' ').every(function(el) {
      return item.value.indexOf(el) > -1;
    });
  });
}
const Wrapper = styled.div`
  position: relative;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.3);
  border-radius: 5px 5px 5px 0;
  padding: 5px;
  margin-top: 15px;
  width: 220px;
`;

const Element = styled.input`
  width: 220px;
  font-size: 13px;
  overflow-y: hidden;
  border: 0;
  outline: none;
  resize: none;
`;

const Selected = styled.div`
  > span:not(:last-child) {
    margin-right: 10px;
  }
`;
const SelectedTag = styled.span`
  background-color: ${primary};
  border-radius: 2px 2px 2px 0;
  color: ${textLight};
  padding: 0 5px;
  font-size: 14px;
  display: inline-block;
`;

const Results = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 5px 5px 5px 0;
  padding: 5px 10px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.3);
`;

const Result = styled.div`
  background-color: ${props => (props.selected ? primaryDisabled : 'white')};
  padding: 0 5px;
  border-radius: 2px 2px 2px 0;
  cursor: pointer;
`;

export default ({ selectedTags, suggestedTags, addTag, removeTag }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const textareaRef = useRef(null);

  useEffect(
    () => {
      if (suggestedTags.length === 0 || !textareaRef.current.value) {
        return;
      }
      setSearchResults(search(suggestedTags, textareaRef.current.value));
    },
    [suggestedTags],
  );

  const focus = e => {
    e.preventDefault();
    textareaRef.current.focus();
  };

  const onChange = e => {
    setSelectedResult(0);
    if (!e.currentTarget.value) {
      setSearchResults([]);
      return;
    }
    setSearchResults(search(suggestedTags, e.currentTarget.value));
  };

  const onKeyDown = e => {
    if (e.keyCode === 40) {
      if (selectedResult < searchResults.length - 1) {
        setSelectedResult(selectedResult + 1);
      }
      return;
    }

    if (e.keyCode === 38) {
      if (selectedResult < 0) {
        setSelectedResult(selectedResult - 1);
      }
      return;
    }

    if (e.keyCode === 13) {
      if (searchResults.length > 0) {
        addTag(searchResults[selectedResult]);
        setSelectedResult(0);
        if (searchResults.length === 1) {
          textareaRef.current.value = '';
          setSearchResults([]);
        }
      }
      return;
    }

    if (e.keyCode === 8) {
      if (selectedTags.length > 0) {
        if (!e.currentTarget.value) {
          removeTag(selectedTags[selectedTags.length - 1]);
        }
      }
    }
  };

  return (
    <Wrapper onMouseDown={focus}>
      <Selected>
        {selectedTags.map(tag => {
          return <SelectedTag key={tag.value}>{tag.value}</SelectedTag>;
        })}
      </Selected>
      <Element onKeyDown={onKeyDown} onChange={onChange} ref={textareaRef} />
      {searchResults.length > 0 && (
        <Results>
          {searchResults.slice(0, 4).map((result, i) => (
            <Result key={result.value} selected={selectedResult === i}>
              {result.value}
            </Result>
          ))}
        </Results>
      )}
    </Wrapper>
  );
};
