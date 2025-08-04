import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarSection } from '../../../Toolbar/ToolbarSection';

export const PieChartSettings = () => {
  return (
    <>
      <ToolbarSection title="Radius" props={['innerRadius', 'outerRadius']}>
        <ToolbarItem full propKey="innerRadius" type="slider" label="Inner Radius" />
        <ToolbarItem full propKey="outerRadius" type="slider" label="Outer Radius" />
      </ToolbarSection>

      <ToolbarSection title="Slice" props={['paddingAngle']}>
        <ToolbarItem full propKey="paddingAngle" type="slider" label="Padding Angle" />
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
    </>
  );
};
