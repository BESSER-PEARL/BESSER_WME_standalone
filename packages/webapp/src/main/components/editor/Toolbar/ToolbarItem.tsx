import { useNode } from '@craftjs/core';
import { Grid2 as Grid, Slider, RadioGroup, Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';

import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarTextInput } from './ToolbarTextInput';

export type ToolbarItemProps = {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey: string;
  index?: number;
  children?: React.ReactNode;
  type: string;
  onChange?: (value: any) => any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
};

export const ToolbarItem = ({
  full = false,
  propKey,
  type,
  onChange,
  index = 0,
  ...props
}: ToolbarItemProps) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    propValue: node.data.props?.[propKey],
  }));

  const value = Array.isArray(propValue)
    ? propValue?.[index]
    : propValue;

  const updateValue = (newVal: any, debounce = 500) => {
    setProp((props: any) => {
      const finalValue = onChange ? onChange(newVal) : newVal;

      if (Array.isArray(props[propKey])) {
        props[propKey][index] = finalValue;
      } else {
        props[propKey] = finalValue;
      }
    }, debounce);
  };

  return (
    <Grid size={{ xs: full ? 12 : 6 }}>
      <div className="mb-2">
        {['text', 'color', 'bg', 'number'].includes(type) ? (
          <ToolbarTextInput
            {...props}
            type={type}
            value={value}
            onChange={updateValue}
          />
        ) : type === 'slider' ? (
          <>
            {props.label && (
              <h4 className="text-sm text-light-gray-2">{props.label}</h4>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Slider
                min={props.min ?? 0}
                max={props.max ?? 100}
                step={props.step ?? 1}
                sx={{
                  color: '#3880ff',
                  height: 2,
                  padding: '5px 0',
                  flex: 1,
                  '& .MuiSlider-track': {
                    height: 2,
                  },
                  '& .MuiSlider-thumb': {
                    height: 12,
                    width: 12,
                  },
                }}
                value={Number(value) || 0}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'number') {
                    updateValue(newValue, 100);
                  }
                }}
              />
              <input
                type="number"
                value={Number(value) || 0}
                onChange={(e) => {
                  const inputVal = parseFloat(e.target.value);
                  if (!isNaN(inputVal)) {
                    updateValue(inputVal, 100);
                  }
                }}
                style={{
                  width: 48,
                  fontSize: '0.75rem',
                  padding: '2px 4px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}
                min={props.min}
                max={props.max}
                step={props.step}
              />
            </div>
          </>
        ) : type === 'radio' ? (
          <>
            {props.label && (
              <h4 className="text-sm text-light-gray-2">{props.label}</h4>
            )}
            <RadioGroup
              value={value ?? ''}
              onChange={(e) => updateValue(e.target.value)}
            >
              {props.children}
            </RadioGroup>
          </>
        ) : type === 'select' ? (
          <ToolbarDropdown
            value={value || ''}
            onChange={updateValue}
            {...props}
          />
        ) : type === 'checkbox' ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => updateValue(e.target.checked, 100)}
                sx={{
                  color: '#3880ff',
                  '&.Mui-checked': {
                    color: 'rgb(19, 115, 230)',
                  },
                }}
                size="small"
              />
            }
            label={props.label}
          />
        ) : null}
      </div>
    </Grid>
  );
};
