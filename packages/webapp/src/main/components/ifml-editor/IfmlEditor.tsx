import React from 'react';
import styled from 'styled-components';

const IfmlContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: var(--apollon-background, #ffffff);
`;

export const IfmlEditor: React.FC = () => {
  return (
    <IfmlContainer>
      <iframe
        src="/ifml-editor/index.html"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block'
        }}
        title="IFML Editor"
      />
    </IfmlContainer>
  );
};