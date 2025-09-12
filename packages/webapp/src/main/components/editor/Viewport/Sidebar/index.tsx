import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import React, { useState } from 'react';
import { styled } from 'styled-components';

import { SidebarItem } from './SidebarItem';

import CustomizeIcon from '../../../../public/icons/customize.svg';
import LayerIcon from '../../../../public/icons/layers.svg';
import DataIcon from '../../../../public/icons/db.svg'
import { Toolbar } from '../../editor-bars/Toolbar';
import { Databar } from '../../editor-bars/Databar';

export const SidebarDiv = styled.div<{ $enabled: boolean }>`
  width: 280px;
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  background: #fff;
  margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
`;

export const Sidebar = () => {
  const [layersVisible, setLayerVisible] = useState(false);
  const [styleVisible, setStyleVisible] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <SidebarDiv $enabled={enabled} className="sidebar transition bg-white w-2">
      <div className="flex flex-col h-full">
        <SidebarItem
          icon={CustomizeIcon}
          title="Style"
          height={!layersVisible ? 'full' : '33%'}
          visible={styleVisible}
          onChange={setStyleVisible}
          className="overflow-auto"
        >
          <Toolbar />
        </SidebarItem>
        <SidebarItem
          icon={DataIcon}
          title="Data"
          height={!layersVisible ? 'full' : '33%'}
          visible={dataVisible}
          onChange={setDataVisible}
          className="overflow-auto"
        >
          <Databar />
        </SidebarItem>
        <SidebarItem
          icon={LayerIcon}
          title="Layers"
          height={!styleVisible && !dataVisible ? 'full' : '33%'}
          visible={layersVisible}
          onChange={setLayerVisible}
        >
          <div className="">
            <Layers expandRootOnLoad={true} />
          </div>
        </SidebarItem>
      </div>
    </SidebarDiv>
  );
};
