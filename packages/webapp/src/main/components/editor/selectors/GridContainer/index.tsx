import React from 'react';

type GridContainerProps = {
  background: string;
  width: string;
  height: string;
  children?: React.ReactNode;
};

const GridContainerComponent: React.FC<Partial<GridContainerProps>> = ({
  background = '#ffffff',
  width = '100%',
  height = '100%',
  children,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        background,
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};

export const GridContainer = Object.assign(GridContainerComponent, {
  craft: {
    displayName: 'GridContainer',
    props: {
      background: '#ffffff',
      width: '100%',
      height: '100%',
    },
  },
});
