import { ToolbarSection } from '../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../editor-bars/ToolbarItem';
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
