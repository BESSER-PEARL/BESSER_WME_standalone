import { ToolbarSection } from '../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../Toolbar/ToolbarItem';
import { DimensionsSettings, PositionSettings } from '../CommonSettings';

export const ButtonSettings = () => {
  return (
    <>
      {/* Typography Section */}
      <ToolbarSection
        title="Typography"
        props={['text', 'textSize']}
        summary={({ text, textSize }: any) => {
          return `${text || ''}, Size: ${textSize || 14}`;
        }}
      >
        <ToolbarItem full propKey="text" type="text" label="Text" />
        <ToolbarItem
          full
          propKey="textSize"
          type="slider"
          label="Text Size"
          min={8}
          max={72}
        />
      </ToolbarSection>

      {/* Colors Section */}
      <ToolbarSection
        title="Colors"
        props={['background', 'color']}
        summary={({ background, color }: any) => {
          return (
            <div className="flex flex-row-reverse items-center gap-2">
              <div
                style={{
                  background: background && `rgba(${Object.values(background)})`,
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <div
                style={{
                  background: color && `rgba(${Object.values(color)})`,
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
            </div>
          );
        }}
      >
        <ToolbarItem full propKey="background" type="bg" label="Background" />
        <ToolbarItem full propKey="color" type="color" label="Text Color" />
      </ToolbarSection>

      <DimensionsSettings />
      <PositionSettings />
    </>
  );
};
