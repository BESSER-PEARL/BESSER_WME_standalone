import { UserComponent, useNode } from '@craftjs/core';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationSettings } from './LocationMapSettings';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';

// Fix for marker icons (important for Vite or modern Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export type LocationMapProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  showMarker: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const LocationMap: UserComponent<Partial<LocationMapProps>> = (props) => {
  const { connectors: { connect } } = useNode();

  const {
    latitude = 49.6117,
    longitude = 6.13,
    zoom = 13,
    showMarker = true,
    x = 0,
    y = 0,
    width = 400,
    height = 300,
  } = props;

  const center: LatLngExpression = [latitude, longitude];

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <div ref={connect} style={{ width: '100%', height: '100%' }}>
        <MapContainer
          {...({
            center,
            zoom,
            scrollWheelZoom: false,
            style: { width: '100%', height: '100%' },
          } as any)}
        >
          <TileLayer
            {...({
              attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            } as any)}
          />
          {showMarker && (
            <Marker position={center}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </DraggableResizableWrapper>
  );
};

LocationMap.craft = {
  displayName: 'LocationMap',
  props: {
    latitude: 49.6117,
    longitude: 6.13,
    zoom: 13,
    showMarker: true,
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  },
  related: {
    toolbar: LocationSettings,
  },
};
