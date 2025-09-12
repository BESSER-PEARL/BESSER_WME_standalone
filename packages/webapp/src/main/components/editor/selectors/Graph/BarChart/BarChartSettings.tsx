import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

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

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
