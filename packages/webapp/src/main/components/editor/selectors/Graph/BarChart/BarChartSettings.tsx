import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarSection } from '../../../Toolbar/ToolbarSection';

export const BarChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Appearance" props={['barColor', 'barSize']}>
        <ToolbarItem full propKey="barColor" type="color" label="Bar Color" />
        <ToolbarItem full propKey="barSize" type="slider" label="Bar Width" />
        <ToolbarItem full propKey="gridColor" type="color" label="Grid Color" />
        <ToolbarItem full propKey="axisColor" type="color" label="Axis/Text Color" />
      </ToolbarSection>

      <ToolbarSection title="Typography" props={['fontSize']}>
        <ToolbarItem full propKey="fontSize" type="slider" label="Axis Font Size" />
      </ToolbarSection>

      <ToolbarSection title="Margin" props={['margin']}>
        <ToolbarItem propKey="margin" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Left" />
      </ToolbarSection>
    </>
  );
};
