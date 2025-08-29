import { ToolbarSection } from '../../Toolbar/ToolbarSection';
import { ToolbarItem } from '../../Toolbar/ToolbarItem';
import { PositionSettings } from '../CommonSettings';

export const VideoSettings = () => {
  return (
    <>
      <ToolbarSection title="Youtube">
        <ToolbarItem
          full={true}
          propKey="videoId"
          type="text"
          label="Video ID"
        />
      </ToolbarSection>
      <PositionSettings />
    </>
  );
};
