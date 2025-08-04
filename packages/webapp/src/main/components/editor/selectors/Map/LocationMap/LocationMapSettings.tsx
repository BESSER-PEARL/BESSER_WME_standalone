import { ToolbarItem } from '../../../Toolbar/ToolbarItem';
import { ToolbarSection } from '../../../Toolbar/ToolbarSection';

export const LocationSettings = () => {
  return (
    <>
      <ToolbarSection title="Ubicación" props={['latitude', 'longitude', 'zoom']}>
        <ToolbarItem
          full
          propKey="latitude"
          type="number"
          label="Latitud"
          min={-90}
          max={90}
          step={0.0001}
        />
        <ToolbarItem
          full
          propKey="longitude"
          type="number"
          label="Longitud"
          min={-180}
          max={180}
          step={0.0001}
        />
        <ToolbarItem
          full
          propKey="zoom"
          type="slider"
          label="Zoom"
          min={1}
          max={18}
          step={1}
        />
      </ToolbarSection>

      <ToolbarSection title="Opciones" props={['showMarker']}>
        <ToolbarItem
          full
          propKey="showMarker"
          type="checkbox"
          label="Mostrar marcador"
        />
      </ToolbarSection>
    </>
  );
};
