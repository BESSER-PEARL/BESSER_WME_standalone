import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

export const PieChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Slice" props={['paddingAngle']}>
        <ToolbarItem full propKey="paddingAngle" type="slider" label="Padding Angle" />
        <ToolbarItem
          full
          propKey="colorPalette"
          type="select"
          label="Palette"
          options={[
            { value: 'default', label: 'Default' },
            { value: 'blues', label: 'Blues' },
            { value: 'warm', label: 'Warm' },
            { value: 'cool', label: 'Cool' },
            { value: 'vibrant', label: 'Vibrant' },
            { value: 'greenBlue', label: 'Green Blue' },
            { value: 'warmPro', label: 'Warm Professional' },
            { value: 'neutral', label: 'Neutral' },
          ]}
        />
      </ToolbarSection>

      <ToolbarSection title="Labels" props={['showLabels', 'labelColor', 'labelPosition']}>
        <ToolbarItem full propKey="showLabels" type="checkbox" label="Show Labels" />
        <ToolbarItem full propKey="labelColor" type="color" label="Label Color" />
        <ToolbarItem
          full
          propKey="labelPosition"
          type="select"
          label="Label Position"
          options={[
            { value: 'inside', label: 'Inside' },
            { value: 'outside', label: 'Outside' },
          ]}
        />
      </ToolbarSection>

      <ToolbarSection title="Legend" props={['showLegend', 'legendPosition']}>
        <ToolbarItem full propKey="showLegend" type="checkbox" label="Show Legend" />
        <ToolbarItem
          full
          propKey="legendPosition"
          type="select"
          label="Legend Position"
          options={[
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </ToolbarSection>

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
