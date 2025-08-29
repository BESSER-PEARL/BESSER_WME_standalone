import React, { useState } from 'react';
import { UserComponent, useNode } from '@craftjs/core';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { WorldMapSettings } from './WorldMapSettings';

// TopoJSON URL
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Map numeric IDs from TopoJSON to ISO_A3 codes
const topoIdToIsoA3: Record<number, string> = {
  4: 'AFG',
  8: 'ALB',
  12: 'DZA',
  32: 'ARG',
  124: 'CAN',
  170: 'COL',
  250: 'FRA',
  352: 'ISL',
  528: 'NOR',
  724: 'ESP',
  710: 'ZAF',
  440: 'LUX',
  // add other countries you need
};

export type WorldMapProps = {
  color: string;
  data: { country: string; value: number }[];
  x: number;
  y: number;
  width: number;
  height: number;
};

export const WorldMap: UserComponent<Partial<WorldMapProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    color = '#007bff',
    data = [
      { country: 'COL', value: 50 },
      { country: 'ESP', value: 80 },
      { country: 'FRA', value: 30 },
      { country: 'LUX', value: 90 },
      { country: 'NOR', value: 70 },
      { country: 'CAN', value: 60 },
      { country: 'ZAF', value: 40 },
    ],
    x = 0,
    y = 0,
    width = 400,
    height = 300,
  } = props;

  const [tooltipContent, setTooltipContent] = useState('');

  const values = data.map(d => d.value);
  const colorScale = scaleLinear<string>()
    .domain([Math.min(...values), Math.max(...values)])
    .range(['#DDD', color]);

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <div
        ref={connect}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {tooltipContent && (
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              top: 0,
              left: 0,
            }}
          >
            {tooltipContent}
          </div>
        )}

        <ComposableMap
          projectionConfig={{ scale: 150 }}
          width={800}
          height={450}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoA3 = topoIdToIsoA3[geo.id];
                const countryData = data.find(d => d.country === isoA3);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countryData ? colorScale(countryData.value) : '#DDD'}
                    stroke="#FFF"
                    onMouseEnter={() =>
                      countryData &&
                      setTooltipContent(`${geo.properties.name}: ${countryData.value}`)
                    }
                    onMouseLeave={() => setTooltipContent('')}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </DraggableResizableWrapper>
  );
};

WorldMap.craft = {
  displayName: 'WorldMap',
  props: {
    color: '#007bff',
    data: [
      { country: 'COL', value: 50 },
      { country: 'ESP', value: 80 },
      { country: 'FRA', value: 30 },
      { country: 'LUX', value: 90 },
      { country: 'NOR', value: 70 },
      { country: 'CAN', value: 60 },
      { country: 'ZAF', value: 40 },
    ],
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  },
  related: {
    toolbar: WorldMapSettings,
  },
};
