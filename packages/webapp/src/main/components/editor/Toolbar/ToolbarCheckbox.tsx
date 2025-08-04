import { Checkbox, FormControlLabel } from '@mui/material';

function StyledCheckbox(props) {
  return (
    <Checkbox
      disableRipple
      color="default"
      size="small"
      sx={{
        '&.Mui-checked': {
          color: 'rgb(19, 115, 230)',
        },
      }}
      {...props}
    />
  );
}

export const ToolbarCheckbox = ({ checked, onChange, label }: any) => {
  return (
    <FormControlLabel
      control={
        <StyledCheckbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={label}
    />
  );
};
