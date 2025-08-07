import { useRef } from 'react';
import {
  Paper, InputBase, IconButton, Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function BuscaCNPJ({ value, onChange, onSubmit }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[BuscaCNPJ] Submit com valor:', value);
    onSubmit(value);
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <Paper
        component="form"
        sx={{
          p: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          width: 360,
          borderRadius: 6,
          backgroundColor: '#f1f5f9'
        }}
        onSubmit={handleSubmit}
      >
        <InputBase
          inputRef={inputRef}
          sx={{ ml: 1, flex: 1, fontSize: 14 }}
          placeholder="Digite o CNPJ"
          inputProps={{ 'aria-label': 'CNPJ' }}
          value={value}
          onChange={(e) => {
            console.log('[BuscaCNPJ] Input alterado:', e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            console.log('[BuscaCNPJ] Campo CNPJ focado');
          }}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}