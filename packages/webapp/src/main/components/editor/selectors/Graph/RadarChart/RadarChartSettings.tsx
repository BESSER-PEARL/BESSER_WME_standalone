import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarSection } from '../../../Toolbar/ToolbarSection';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

export const RadarChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Appearance" props={['strokeColor', 'fillColor']}>
        <ToolbarItem full propKey="strokeColor" type="color" label="Stroke Color" />
        <ToolbarItem full propKey="fillColor" type="color" label="Fill Color" />
      </ToolbarSection>

      <ToolbarSection title="Options" props={['showGrid', 'showTooltip']}>
        <ToolbarItem full propKey="showGrid" type="checkbox" label="Show Grid" />
        <ToolbarItem full propKey="showTooltip" type="checkbox" label="Show Tooltip" />
      </ToolbarSection>

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
