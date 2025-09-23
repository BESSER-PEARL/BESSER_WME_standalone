import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

export const LineChartSettings = () => {
  return (
    <>
      <ToolbarSection
        title="Appearance"
        props={['lineColor', 'lineWidth', 'gridColor', 'axisColor']}
      >
        <ToolbarItem full propKey="lineColor" type="color" label="Line Color" />
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
