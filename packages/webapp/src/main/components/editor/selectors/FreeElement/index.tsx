import React from 'react';
import { Rnd } from 'react-rnd';
import { useNode } from '@craftjs/core';
import { FreeElementSettings } from './FreeElementSettings';

export const FreeElement = ({ children }: any) => {
  const {
    connectors: { connect },
    selected,
    actions: { setProp },
    x,
    y,
    width,
    height,
  } = useNode((node) => ({
    selected: node.events.selected,
    x: node.data.props.x,
    y: node.data.props.y,
    width: node.data.props.width,
    height: node.data.props.height,
  }));

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      dragGrid={[10, 10]}
      resizeGrid={[10, 10]}
      onDragStop={(e, d) => {
        setProp((props: any) => {
          props.x = d.x;
          props.y = d.y;
        }, 500);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setProp((props: any) => {
          props.width = ref.offsetWidth;
          props.height = ref.offsetHeight;
          props.x = position.x;
          props.y = position.y;
        }, 500);
      }}
      bounds="parent"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <div
        ref={connect}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#fff',
            border: selected ? '2px solid #2680eb' : '1px solid #ccc',
            borderRadius: 4,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
};

FreeElement.craft = {
  displayName: 'Free Element',
  props: {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
  },
  rules: {
    canDrag: () => false,
  },
  related: {
    toolbar: FreeElementSettings,
  },
};
