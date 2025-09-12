import { ToolbarSection } from '../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../editor-bars/ToolbarItem';
import { DimensionsSettings, PositionSettings } from '../CommonSettings';

export const ContainerSettings = () => {
  return (
    <>
      <PositionSettings />
      <DimensionsSettings />

      {/* Colors */}
      <ToolbarSection
        title="Colors"
        props={['background', 'color']}
        summary={({ background, color }: any) => (
          <div className="flex flex-row-reverse">
            <div
              style={{ background: background && `rgba(${Object.values(background)})` }}
              className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full"
            >
              <p style={{ color: color && `rgba(${Object.values(color)})` }} className="text-white w-full text-center">
                T
              </p>
            </div>
          </div>
        )}
      >
        <ToolbarItem full={true} propKey="background" type="bg" label="Background" />
        <ToolbarItem full={true} propKey="borderColor" type="color" label="Border" />
      </ToolbarSection>

      {/* Padding */}
      <ToolbarSection
        title="Padding"
        props={['padding']}
        summary={({ padding }: any) =>
          `${padding?.[0] || 0}px ${padding?.[1] || 0}px ${padding?.[2] || 0}px ${padding?.[3] || 0}px`
        }
      >
        <ToolbarItem propKey="padding" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="padding" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="padding" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="padding" index={3} type="slider" label="Left" />
      </ToolbarSection>

      {/* Decoration */}
      <ToolbarSection title="Decoration" props={['radius', 'shadow']}>
        <ToolbarItem full={true} propKey="radius" type="slider" label="Radius" />
        <ToolbarItem full={true} propKey="shadow" type="slider" label="Shadow" />
      </ToolbarSection>
    </>
  );
};
