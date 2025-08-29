import { ToolbarSection } from '../Toolbar/ToolbarSection';
import { ToolbarItem } from '../Toolbar/ToolbarItem';

export function DimensionsSettings() {
  return (
    <>
      <ToolbarSection
        title="Dimensions"
        props={['width', 'height']}
        summary={({ width, height }: any) => {
          return `${width || 0} x ${height || 0}`;
        }}
      >
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>
    </>
  );
}

export function MarginSettings() {
  return (
    <>
      <ToolbarSection
        title="Margin"
        props={['margin']}
        summary={({ margin }: any) => {
          const safeMargin = margin || [0, 0, 0, 0];
          return `${safeMargin[0]}px ${safeMargin[1]}px ${safeMargin[2]}px ${safeMargin[3]}px`;
        }}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Left" />
      </ToolbarSection>
    </>
  );
}

export function PositionSettings() {
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
    </>
  );
}