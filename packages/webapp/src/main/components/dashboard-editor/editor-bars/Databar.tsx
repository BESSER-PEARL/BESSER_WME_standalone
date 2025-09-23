import { useEditor } from '@craftjs/core';
import React from 'react';

export * from './ToolbarItem';
export * from './ToolbarSection';
export * from './ToolbarTextInput';
export * from './ToolbarDropdown';

export const Databar = () => {
  const { active, related } = useEditor((state, query) => {
    const currentlySelectedNodeId = query.getEvent('selected').first();
    return {
      active: currentlySelectedNodeId,
      related:
        currentlySelectedNodeId && state.nodes[currentlySelectedNodeId].related,
    };
  });

  return (
    <div className="py-1 h-full">
      {active && related.databar && React.createElement(related.databar)}
      {!active && (
        <div
          className="px-5 py-2 flex flex-col items-center h-full justify-center text-center"
          style={{
            color: 'rgba(0, 0, 0, 0.56)',
            fontSize: '11px',
          }}
        >
          <h2 className="pb-1">Select a component to view data settings.</h2>
          <h2>
            Data settings for the selected element will appear here.
          </h2>
        </div>
      )}
    </div>
  );
};