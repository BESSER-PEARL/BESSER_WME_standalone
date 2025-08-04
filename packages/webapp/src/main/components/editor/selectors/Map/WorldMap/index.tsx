import { UserComponent, useNode } from '@craftjs/core';
import ReactSvgWorldMap from 'react-svg-worldmap'; // Solo default import
import { WorldMapSettings } from './WorldMapSettings';

export type WorldMapProps = {
  color: string;
  valueSuffix: string;
  data: { country: string; value: number }[]; // Cambiado a string
};

export const WorldMap: UserComponent<Partial<WorldMapProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    color = '#007bff',
    valueSuffix = ' visitors',
    data = [
      { country: 'cn', value: 1389618778 },
      { country: 'in', value: 1311559204 },
      { country: 'us', value: 331883986 },
      { country: 'id', value: 264935824 },
      { country: 'pk', value: 210797836 },
    ],
  } = props;

  return (
    <div
      ref={(ref) => ref && connect(ref)}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        border: `1px solid ${color}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <ReactSvgWorldMap
        color={color}
        valueSuffix={valueSuffix}
        size="responsive"
        data={data}
      />
    </div>
  );
};

WorldMap.craft = {
  displayName: 'WorldMap',
  props: {
    color: '#007bff',
    valueSuffix: ' visitors',
    data: [
      { country: 'cn', value: 1389618778 },
      { country: 'in', value: 1311559204 },
      { country: 'us', value: 331883986 },
      { country: 'id', value: 264935824 },
      { country: 'pk', value: 210797836 },
    ],
  },
  related: {
    toolbar: WorldMapSettings,
  },
};
