import { useNode, useEditor, UserComponent } from '@craftjs/core';
import YouTube from 'react-youtube';
import { styled } from 'styled-components';

import { VideoSettings } from './VideoSettings';
import { DraggableResizableWrapper } from '../DragResizableWrapper';

const YoutubeDiv = styled.div<{ $enabled: boolean }>`
  width: 100%;
  height: 100%;
  > div {
    height: 100%;
  }
  iframe {
    pointer-events: ${(props) => (props.$enabled ? 'none' : 'auto')};
  }
`;

export type VideoProps = {
  videoId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export const Video: UserComponent<Partial<VideoProps>> = ({
  videoId = '4lnH9Kxdy-k',
  x = 0,
  y = 0,
  width = 400,
  height = 250,
}) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const {
    connectors: { connect },
  } = useNode();

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <YoutubeDiv
        ref={(dom) => {
          if (dom) connect(dom);
        }}
        $enabled={enabled}
      >
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            height: '100%',
          }}
        />
      </YoutubeDiv>
    </DraggableResizableWrapper>
  );
};

Video.craft = {
  displayName: 'Video',
  props: {
    videoId: '4lnH9Kxdy-k',
    x: 0,
    y: 0,
    width: 400,
    height: 250,
  },
  related: {
    toolbar: VideoSettings,
  },
};
