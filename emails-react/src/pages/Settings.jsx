import { useThemeContext } from '../context/ThemeContext';
import { Box, Paper, Typography, Switch, FormControlLabel } from '@mui/material';

const Settings = () => {
  const { mode, toggleTheme } = useThemeContext();
  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" gutterBottom>Definições</Typography>
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label={mode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
        />
      </Paper>
    </Box>
  );
};

export default Settings; 