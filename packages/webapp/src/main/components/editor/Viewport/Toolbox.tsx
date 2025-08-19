import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Element, useEditor } from '@craftjs/core';
import { styled } from 'styled-components';
import { SidebarItem } from './Sidebar/SidebarItem';

import ButtonIcon from '../icons/Button';
import ContainerIcon from '../icons/Rectangle';
import TextIcon from '../icons/Text';
import YoutubeIcon from '../icons/VideoLine';
import LineChartIcon from '../icons/LineChart';
import BarChartIcon from '../icons/BarChart';
import PieChartIcon from '../icons/PieChart';
import RadarChartIcon from '../icons/RadarChart';
import RadialChartIcon from '../icons/RadialChart';
import WorldMapIcon from '../icons/WorldMap';
import LocationMapIcon from '../icons/LocationMap';

import { Button } from '../selectors/Button';
import { Container } from '../selectors/Container';
import { Text } from '../selectors/Text';
import { Video } from '../selectors/Video';
import { LineChart } from '../selectors/Graph/LineChart';
import { BarChart } from '../selectors/Graph/BarChart';
import { PieChart } from '../selectors/Graph/PieChart';
import { RadarChart } from '../selectors/Graph/RadarChart';
import { RadialBarChart } from '../selectors/Graph/RadialBarChart';
import { WorldMap } from '../selectors/Map/WorldMap';
import { LocationMap } from '../selectors/Map/LocationMap';

import CustomizeIcon from '../../../public/icons/customize.svg';

const ToolboxDiv = styled.div<{ $enabled: boolean }>`
  width: 110px;
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  background: #fff;
  margin-right: ${(props) => (props.$enabled ? 0 : -110)}px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
  overflow: visible;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px 8px;
`;

const ItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  cursor: grab;

  svg {
    width: 20px;
    height: 20px;
    fill: #707070;
    transition: fill 0.2s;
  }

  &:hover svg {
    fill: #3880ff;
  }
`;

// Tooltip renderizado con portal:
const TooltipPortal: React.FC<{ text: string; position: { top: number; left: number } | null }> = ({
  text,
  position,
}) => {
  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 11,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        transform: 'translate(8px, -50%)',
        zIndex: 10000,
        userSelect: 'none',
      }}
    >
      {text}
    </div>,
    document.body
  );
};

export const Toolbox = () => {
  const {
    enabled,
    connectors: { create },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [basicOpen, setBasicOpen] = useState(true);
  const [graphOpen, setGraphOpen] = useState(true);

  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const hoverRef = useRef<HTMLDivElement | null>(null);

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>, text: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipText(text);
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right,
    });
    hoverRef.current = e.currentTarget as HTMLDivElement;
  };

  const onMouseLeave = () => {
    setTooltipText(null);
    setTooltipPos(null);
    hoverRef.current = null;
  };

  const safeCreate = (ref: HTMLElement | null, element: React.ReactElement) => {
    if (ref) create(ref, element);
  };

  return (
    <>
      <ToolboxDiv $enabled={enabled}>
        <SidebarItem
          title="Basic"
          height={basicOpen ? 'auto' : '45px'}
          visible={basicOpen}
          onChange={setBasicOpen}
        >
          <ItemGrid>
            <div
              ref={(ref) =>
                safeCreate(
                ref,
                <Element canvas is={Container} />
              )
              }
            >
              <ItemWrapper
                onMouseEnter={(e) => onMouseEnter(e, 'Container')}
                onMouseLeave={onMouseLeave}
              >
                <ContainerIcon />
              </ItemWrapper>
            </div>

            <div ref={(ref) => safeCreate(ref, <Text fontSize="12" textAlign="left" text="Hi there" />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Text')} onMouseLeave={onMouseLeave}>
                <TextIcon />
              </ItemWrapper>
            </div>

            <div ref={(ref) => safeCreate(ref, <Button />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Button')} onMouseLeave={onMouseLeave}>
                <ButtonIcon />
              </ItemWrapper>
            </div>

            <div ref={(ref) => safeCreate(ref, <Video />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Video')} onMouseLeave={onMouseLeave}>
                <YoutubeIcon />
              </ItemWrapper>
            </div>
          </ItemGrid>
        </SidebarItem>

        <SidebarItem
          title="Graph"
          height={graphOpen ? 'auto' : '45px'}
          visible={graphOpen}
          onChange={setGraphOpen}
        >
          <ItemGrid>
            <div ref={(ref) => safeCreate(ref, <LineChart />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Line Chart')} onMouseLeave={onMouseLeave}>
                <LineChartIcon />
              </ItemWrapper>
            </div>

            <div ref={(ref) => safeCreate(ref, <BarChart />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Bar Chart')} onMouseLeave={onMouseLeave}>
                <BarChartIcon />
              </ItemWrapper>
            </div>
            <div ref={(ref) => safeCreate(ref, <PieChart />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Pie Chart')} onMouseLeave={onMouseLeave}>
                <PieChartIcon />
              </ItemWrapper>
            </div>
            <div ref={(ref) => safeCreate(ref, <RadarChart />)}>
              <ItemWrapper onMouseEnter={(e) => onMouseEnter(e, 'Radar Chart')} onMouseLeave={onMouseLeave}>
                <RadarChartIcon />
              </ItemWrapper>
            </div>
            <div ref={(ref) => safeCreate(ref, <RadialBarChart />)}>
              <ItemWrapper
                onMouseEnter={(e) => onMouseEnter(e, 'Radial Bar Chart')}
                onMouseLeave={onMouseLeave}
              >
                <RadialChartIcon />
              </ItemWrapper>
            </div>
          </ItemGrid>
        </SidebarItem>

        <SidebarItem
          title="Map"
          height={graphOpen ? 'auto' : '45px'}
          visible={graphOpen}
          onChange={setGraphOpen}
        >
          <ItemGrid>
            <div ref={(ref) => safeCreate(ref, <WorldMap />)}>
              <ItemWrapper
                onMouseEnter={(e) => onMouseEnter(e, 'World Map')}
                onMouseLeave={onMouseLeave}
              >
                <WorldMapIcon />
              </ItemWrapper>
            </div>
            <div ref={(ref) => safeCreate(ref, <LocationMap />)}>
              <ItemWrapper
                onMouseEnter={(e) => onMouseEnter(e, 'Location Map')}
                onMouseLeave={onMouseLeave}
              >
                <LocationMapIcon />
              </ItemWrapper>
            </div>
          </ItemGrid>
        </SidebarItem>
      </ToolboxDiv>

      {/* Tooltip portal */}
      {tooltipText && tooltipPos && <TooltipPortal text={tooltipText} position={tooltipPos} />}
    </>
  );
};
