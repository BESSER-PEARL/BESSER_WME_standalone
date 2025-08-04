import React from 'react';
import { ToolbarSection } from '../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../Toolbar/ToolbarItem';

export const GridContainerSettings = () => {
  return (
    <>
      <ToolbarSection title="Grid Container">
        <ToolbarItem propKey="background" type="color" label="Background" />
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>
    </>
  );
};
