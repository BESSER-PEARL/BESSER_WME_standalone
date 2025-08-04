import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarSection } from '../../../Toolbar/ToolbarSection';

export const WorldMapSettings = () => {
  return (
    <>
      <ToolbarSection title="Appearance" props={['color']}>
        <ToolbarItem full propKey="color" type="color" label="Map Color" />
      </ToolbarSection>

      <ToolbarSection title="Data" props={['valueSuffix']}>
        <ToolbarItem full propKey="valueSuffix" type="text" label="Value Suffix" />
      </ToolbarSection>
    </>
  );
};
