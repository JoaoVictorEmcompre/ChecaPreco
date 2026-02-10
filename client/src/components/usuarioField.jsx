import { TextField, InputAdornment } from '@mui/material';
import { Person } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: '#f8f9fb',
    border: '1.5px solid #e2e8f0',
    transition: 'all 0.2s ease',
    '& fieldset': { border: 'none' },
    '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' },
    '&.Mui-focused': { backgroundColor: '#fff', borderColor: '#CB3B31', boxShadow: '0 0 0 3px rgba(203, 59, 49, 0.1)' },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': { color: '#CB3B31' },
  },
}));

export default function UsuarioField({ value, onChange, error, helperText, disabled }) {
  console.log('[UsuarioField] Render | value:', value, '| error:', error, '| disabled:', disabled);

  return (
    <StyledTextField
      fullWidth
      label="Usuario"
      value={value}
      onChange={e => {
        console.log('[UsuarioField] Input alterado:', e.target.value);
        onChange(e);
      }}
      error={!!error}
      helperText={helperText}
      placeholder="Digite seu usuario"
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Person sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
