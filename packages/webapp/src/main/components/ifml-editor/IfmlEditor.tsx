import React, { useRef, useEffect, useState } from 'react';
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

const ModelButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
`;

export const IfmlEditor: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ifmlModel, setIfmlModel] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'IFML_MODEL_RESPONSE') {
        setIfmlModel(event.data.data);
        console.log('IFML Model received:', event.data.data);
      } else if (event.data && event.data.type === 'IFML_MODEL_CHANGED') {
        setIfmlModel(event.data.data);
        console.log('IFML Model changed:', event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const getIfmlModel = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'GET_IFML_MODEL'
      }, '*');
    }
  };

  const downloadModel = () => {
    if (ifmlModel) {
      const blob = new Blob([JSON.stringify(ifmlModel, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ifml-model.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <IfmlContainer>
      <ModelButton onClick={getIfmlModel}>
        Get IFML Model
      </ModelButton>
      {ifmlModel && (
        <ModelButton onClick={downloadModel} style={{ right: '150px' }}>
          Download Model
        </ModelButton>
      )}
      <iframe
        ref={iframeRef}
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