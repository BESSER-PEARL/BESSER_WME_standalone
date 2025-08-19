import React from 'react';
import { Rnd } from 'react-rnd';
import { useNode } from '@craftjs/core';

interface WrapperProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export const DraggableResizableWrapper = ({ children, x = 100, y = 100, width = 300, height = 200 }: WrapperProps) => {
  const {
    connectors: { connect },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      dragGrid={[1, 1]}
      resizeGrid={[1, 1]}
      bounds="parent"
      onDragStart={() => setProp((props: any) => { props.isDragging = true; })}
      onDragStop={(e, d) => setProp((props: any) => {
        props.x = d.x;
        props.y = d.y;
        props.isDragging = false;
      }, 500)}
      onResizeStart={() => setProp((props: any) => { props.isDragging = true; })}
      onResizeStop={(e, direction, ref, delta, position) => {
        setProp((props: any) => {
          props.width = ref.offsetWidth;
          props.height = ref.offsetHeight;
          props.x = position.x;
          props.y = position.y;
          props.isDragging = false;
        }, 500);
      }}
      enableResizing={{
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      }}
    >
      <div
        ref={connect}
        className="child-draggable"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          userSelect: 'none',
          border: selected ? '2px solid #2680eb' : undefined,
          borderRadius: 4,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};
