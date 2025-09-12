import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { DimensionsSettings, MarginSettings, PositionSettings } from '../../CommonSettings';

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
      </ToolbarSection>

      <ToolbarSection title="Opciones" props={['showMarker']}>
        <ToolbarItem
          full
          propKey="showMarker"
          type="checkbox"
          label="Mostrar marcador"
        />
      </ToolbarSection>

      <DimensionsSettings />
      <MarginSettings />
      <PositionSettings />
    </>
  );
};
