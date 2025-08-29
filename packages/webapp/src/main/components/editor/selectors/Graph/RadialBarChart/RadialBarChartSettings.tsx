import { ToolbarSection } from '../../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

export const RadialBarChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Radius" props={['innerRadius', 'outerRadius']}>
        <ToolbarItem
          full
          propKey="innerRadius"
          type="slider"
          label="Inner Radius"
          min={0}
          max={150}
          step={1}
        />
        <ToolbarItem
          full
          propKey="outerRadius"
          type="slider"
          label="Outer Radius"
          min={0}
          max={150}
          step={1}
        />
      </ToolbarSection>

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

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
