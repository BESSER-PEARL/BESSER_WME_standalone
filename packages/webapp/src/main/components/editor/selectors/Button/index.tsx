import React from 'react';
import { UserComponent, useNode } from '@craftjs/core';
import { DraggableResizableWrapper } from '../DragResizableWrapper';
import { ButtonSettings } from './ButtonSettings';
import { normalizeColor, safeNumber } from '../../../../utils/charts';

export type ButtonProps = {
  text?: string;
  textSize?: number;
  background?: Record<'r' | 'g' | 'b' | 'a', number> | string;
  color?: Record<'r' | 'g' | 'b' | 'a', number>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export const Button: UserComponent<Partial<ButtonProps>> = (props) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const {
    text = 'Button',
    textSize = 14,
    background,
    color,
    x = 100,
    y = 100,
    width = 120,
    height = 40,
  } = props;

  const finalColor = color 
    ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a !== undefined ? color.a : 1})`
    : 'rgba(255, 255, 255, 1)';

  const finalBg = normalizeColor(background, 'rgba(76,175,80,1)');
  const finalTextSize = safeNumber(textSize, 14);

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: finalBg,
          borderRadius: 4,
          cursor: 'pointer',
          padding: '8px 16px',
          boxSizing: 'border-box',
        }}
      >
        <span 
          style={{ 
            fontSize: `${finalTextSize}px`,
            color: finalColor,
            textAlign: 'center',
            margin: 0,
            padding: 0,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            fontFamily: 'inherit',
            fontWeight: 'normal',
          }}
        >
          {text}
        </span>
      </div>
    </DraggableResizableWrapper>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Button',
    textSize: 14,
    background: 'rgba(76,175,80,1)',
    color: { r: 255, g: 255, b: 255, a: 1 },
    x: 100,
    y: 100,
    width: 120,
    height: 40,
  },
  related: {
    toolbar: ButtonSettings,
  },
};