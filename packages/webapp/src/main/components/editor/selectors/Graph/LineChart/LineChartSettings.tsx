import { ToolbarSection } from '../../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarRadio } from '../../../Toolbar/ToolbarRadio';

export const LineChartSettings = () => {
  return (
    <>
      <ToolbarSection
        title="Dimensions"
        props={['width', 'height']}
        summary={({ width, height }: any) => {
          return `${width || 0} x ${height || 0}`;
        }}
      >
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>

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

      <ToolbarSection
        title="Margin"
        props={['margin']}
        summary={({ margin }: any) => {
          const safeMargin = margin || [0, 0, 0, 0];
          return `${safeMargin[0]}px ${safeMargin[1]}px ${safeMargin[2]}px ${safeMargin[3]}px`;
        }}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Left" />
      </ToolbarSection>

      <ToolbarSection
        title="Padding"
        props={['padding']}
        summary={({ padding }: any) => {
          const safePadding = padding || [0, 0, 0, 0];
          return `${safePadding[0]}px ${safePadding[1]}px ${safePadding[2]}px ${safePadding[3]}px`;
        }}
      >
        <ToolbarItem propKey="padding" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="padding" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="padding" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="padding" index={3} type="slider" label="Left" />
      </ToolbarSection>

      <ToolbarSection title="Decoration" props={['radius', 'shadow']}>
        <ToolbarItem full propKey="radius" type="slider" label="Radius" />
        <ToolbarItem full propKey="shadow" type="slider" label="Shadow" />
      </ToolbarSection>

      <ToolbarSection title="Alignment">
        <ToolbarItem propKey="flexDirection" type="radio" label="Flex Direction">
          <ToolbarRadio value="row" label="Row" />
          <ToolbarRadio value="column" label="Column" />
        </ToolbarItem>
        <ToolbarItem propKey="fillSpace" type="radio" label="Fill space">
          <ToolbarRadio value="yes" label="Yes" />
          <ToolbarRadio value="no" label="No" />
        </ToolbarItem>
        <ToolbarItem propKey="alignItems" type="radio" label="Align Items">
          <ToolbarRadio value="flex-start" label="Flex start" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Flex end" />
        </ToolbarItem>
        <ToolbarItem propKey="justifyContent" type="radio" label="Justify Content">
          <ToolbarRadio value="flex-start" label="Flex start" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Flex end" />
        </ToolbarItem>
      </ToolbarSection>

      <ToolbarSection
        title="Colors"
        props={['background', 'color']}
        summary={({ background, color }: any) => {
          return (
            <div className="flex flex-row-reverse">
              <div
                style={{
                  background: background && `rgba(${Object.values(background)})`,
                }}
                className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              >
                <p
                  style={{
                    color: color && `rgba(${Object.values(color)})`,
                  }}
                  className="text-white w-full text-center"
                >
                  T
                </p>
              </div>
            </div>
          );
        }}
      >
        <ToolbarItem full propKey="background" type="bg" label="Background" />
        <ToolbarItem full propKey="color" type="color" label="Text" />
      </ToolbarSection>
    </>
  );
};
