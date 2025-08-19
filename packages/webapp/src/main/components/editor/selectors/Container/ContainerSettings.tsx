import React from 'react';
import { ToolbarSection } from '../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../Toolbar/ToolbarItem';

export const ContainerSettings = () => {
  return (
    <>
      {/* Position */}
      <ToolbarSection
        title="Position"
        props={['x', 'y']}
        summary={({ x, y }: any) => `${x || 0}px, ${y || 0}px`}
      >
        <ToolbarItem propKey="x" type="text" label="X" />
        <ToolbarItem propKey="y" type="text" label="Y" />
      </ToolbarSection>

      {/* Dimensions */}
      <ToolbarSection
        title="Dimensions"
        props={['width', 'height']}
        summary={({ width, height }: any) => `${width || 0}px × ${height || 0}px`}
      >
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>

      {/* Colors */}
      <ToolbarSection
        title="Colors"
        props={['background', 'color']}
        summary={({ background, color }: any) => (
          <div className="flex flex-row-reverse">
            <div
              style={{ background: background && `rgba(${Object.values(background)})` }}
              className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full"
            >
              <p style={{ color: color && `rgba(${Object.values(color)})` }} className="text-white w-full text-center">
                T
              </p>
            </div>
          </div>
        )}
      >
        <ToolbarItem full={true} propKey="background" type="bg" label="Background" />
        <ToolbarItem full={true} propKey="borderColor" type="color" label="Border" />
      </ToolbarSection>

      {/* Padding */}
      <ToolbarSection
        title="Padding"
        props={['padding']}
        summary={({ padding }: any) =>
          `${padding?.[0] || 0}px ${padding?.[1] || 0}px ${padding?.[2] || 0}px ${padding?.[3] || 0}px`
        }
      >
        <ToolbarItem propKey="padding" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="padding" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="padding" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="padding" index={3} type="slider" label="Left" />
      </ToolbarSection>

      {/* Decoration */}
      <ToolbarSection title="Decoration" props={['radius', 'shadow']}>
        <ToolbarItem full={true} propKey="radius" type="slider" label="Radius" />
        <ToolbarItem full={true} propKey="shadow" type="slider" label="Shadow" />
      </ToolbarSection>
    </>
  );
};
