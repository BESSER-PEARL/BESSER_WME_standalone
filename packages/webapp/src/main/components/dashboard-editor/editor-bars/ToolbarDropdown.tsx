import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const ToolbarDropdown = ({ label, value, onChange, options = [] }: any) => {
  return (
    <FormControl fullWidth size="small" margin="dense">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        native={false}
      >
        {options.map((option: any) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
