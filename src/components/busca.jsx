import { Paper, InputBase, IconButton, Divider, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

export default function CampoDeBusca({ value, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <Paper
        component="form"
        sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 360, borderRadius: 6, backgroundColor: '#f1f5f9' }}
        onSubmit={handleSubmit}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: 14 }}
          placeholder="Escanei ou digite o código do item"
          inputProps={{ 'aria-label': 'código de barras' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <IconButton sx={{ p: '10px' }} aria-label="camera">
          <CameraAltIcon />
        </IconButton>
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
