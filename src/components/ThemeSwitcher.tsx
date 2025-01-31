import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import { useColorScheme } from '@mui/material/styles';
import { DarkModeRounded, LightModeOutlined } from '@mui/icons-material';
import {Checkbox} from '@mui/material';

function ThemeSwitcher() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <FormControl>
      <Checkbox 
        checked={ mode === 'dark'}
        onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
        icon={<DarkModeRounded />}
        checkedIcon={<LightModeOutlined />}
      />
    </FormControl>
          
  );
}

export default function ToggleColorMode() {
  return (
    <ThemeSwitcher />
  );
}
