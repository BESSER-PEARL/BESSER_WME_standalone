import React from 'react';
import { Rnd } from 'react-rnd';
import { useNode, UserComponent } from '@craftjs/core';
import { ContainerSettings } from './ContainerSettings';
import { normalizeColor, safeNumber, safeMargin } from '../../../../utils/charts';

export type ContainerProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  background?: string | { r: number; g: number; b: number; a?: number };
  borderColor?: string | { r: number; g: number; b: number; a?: number };
  padding?: [number, number, number, number];
  radius?: number;
  shadow?: number;
  isDragging?: boolean;
  children?: React.ReactNode;
};

export const Container: UserComponent<Partial<ContainerProps>> = (props) => {
  const {
    connectors: { connect },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const {
    x = 100,
    y = 100,
    width = 300,
    height = 200,
    background,
    borderColor,
    padding,
    radius,
    shadow,
    children,
  } = props;

  const finalBg = normalizeColor(background, '#fff');
  const finalBorderColor = normalizeColor(borderColor, '#ccc');
  const finalPadding = safeMargin(padding); 
  const finalRadius = safeNumber(radius, 4);
  const finalShadow = safeNumber(shadow, 0);

  const handleDragStart = (e: any) => {
    e.stopPropagation();
    setProp((p: any) => { p.isDragging = true; });
  };

  const handleDragStop = (e: any, d: any) => {
    e.stopPropagation();
    setProp((p: any) => {
      p.x = d.x;
      p.y = d.y;
      p.isDragging = false;
    }, 500);
  };

  const handleResizeStop = (e: any, dir: any, ref: HTMLElement, delta: any, pos: any) => {
    e.stopPropagation();
    setProp((p: any) => {
      p.width = ref.offsetWidth;
      p.height = ref.offsetHeight;
      p.x = pos.x;
      p.y = pos.y;
      p.isDragging = false;
    }, 500);
  };

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds="parent"
      dragGrid={[1, 1]}
      resizeGrid={[1, 1]}
      cancel=".child-draggable"
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
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
          width: '100%',
          height: '100%',
          position: 'relative',
          userSelect: 'none',
          background: finalBg,
          border: selected
            ? `2px solid #2680eb`
            : `1px solid ${finalBorderColor}`,
          borderRadius: finalRadius,
          boxShadow:
            finalShadow === 0
              ? 'none'
              : `0px ${finalShadow}px ${finalShadow * 2}px rgba(0, 0, 0, 0.13)`,
          padding: `${finalPadding[0]}px ${finalPadding[1]}px ${finalPadding[2]}px ${finalPadding[3]}px`,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    background: '#fff',
    borderColor: '#ccc',
    padding: [10, 10, 10, 10],
    radius: 4,
    shadow: 0,
    isDragging: false,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};