import React from 'react';
import { ToolbarSection } from '../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../Toolbar/ToolbarItem';

export const FreeElementSettings = () => {
  return (
    <>
      <ToolbarSection
        title="Position"
        props={['x', 'y']}
        summary={({ x, y }: any) => `${x || 0}px, ${y || 0}px`}
      >
        <ToolbarItem propKey="x" type="text" label="X" />
        <ToolbarItem propKey="y" type="text" label="Y" />
      </ToolbarSection>

      <ToolbarSection
        title="Dimensions"
        props={['width', 'height']}
        summary={({ width, height }: any) => `${width || 0}px × ${height || 0}px`}
      >
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>
    </>
  );
};
