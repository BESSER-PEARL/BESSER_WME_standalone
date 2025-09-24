import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../../../dashboard-editor/selectors/CommonSettings';

export const RadarChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Appearance" props={['borderColor', 'fillColor']}>
        <ToolbarItem full propKey="borderColor" type="color" label="Border Color" />
        <ToolbarItem full propKey="fillColor" type="color" label="Fill Color" />
      </ToolbarSection>

      <ToolbarSection title="Options" props={['showGrid', 'showTooltip', 'showRadiusAxis']}>
        <ToolbarItem full propKey="showGrid" type="checkbox" label="Show Grid" />
        <ToolbarItem full propKey="showTooltip" type="checkbox" label="Show Tooltip" />
        <ToolbarItem full propKey="showRadiusAxis" type="checkbox" label="Show Radius Axis" />
      </ToolbarSection>

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
