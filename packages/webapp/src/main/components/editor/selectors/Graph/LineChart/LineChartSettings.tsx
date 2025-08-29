import { ToolbarSection } from '../../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

export const LineChartSettings = () => {
  return (
    <>
      <ToolbarSection
        title="Appearance"
        props={['color', 'lineWidth', 'gridColor', 'axisColor']}
      >
        <ToolbarItem full propKey="color" type="color" label="Line Color" />
        <ToolbarItem full propKey="lineWidth" type="slider" label="Line Width" />
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
