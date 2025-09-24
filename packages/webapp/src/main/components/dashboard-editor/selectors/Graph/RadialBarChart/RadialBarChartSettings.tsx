import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../../../dashboard-editor/selectors/CommonSettings';

export const RadialBarChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Angles" props={['startAngle', 'endAngle']}>
        <ToolbarItem
          full
          propKey="startAngle"
          type="slider"
          label="Start Angle"
          min={0}
          max={360}
          step={1}
        />
        <ToolbarItem
          full
          propKey="endAngle"
          type="slider"
          label="End Angle"
          min={-360}
          max={360}
          step={1}
        />
      </ToolbarSection>

      <ToolbarSection title="Colors" props={['colorPalette']}>
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

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
