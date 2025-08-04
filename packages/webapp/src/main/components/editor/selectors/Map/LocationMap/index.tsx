import { UserComponent, useNode } from '@craftjs/core';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationSettings } from './LocationMapSettings';

// Fix para íconos de marcador (importante para Vite o Webpack moderno)
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
};

export const LocationMap: UserComponent<Partial<LocationMapProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    latitude = 40.7128,
    longitude = -74.006,
    zoom = 13,
    showMarker = true,
  } = props;

  const center: LatLngExpression = [latitude, longitude];

  return (
    <div ref={(ref) => ref && connect(ref)} style={{ width: '100%', height: 300 }}>
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
            <Popup>Ubicación seleccionada</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

LocationMap.craft = {
  displayName: 'LocationMap',
  props: {
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 13,
    showMarker: true,
  },
  related: {
    toolbar: LocationSettings,
  },
};
