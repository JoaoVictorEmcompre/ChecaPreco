import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

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

export default function SenhaField({ value, onChange, error, helperText, disabled }) {
  const [showPassword, setShowPassword] = useState(false);

  console.log('[SenhaField] Render | value:', value, '| error:', error);

  return (
    <StyledTextField
      fullWidth
      label="Senha"
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={(e) => {
        console.log('[SenhaField] Input alterado:', e.target.value);
        onChange(e);
      }}
      error={!!error}
      helperText={helperText}
      placeholder="Digite sua senha"
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                setShowPassword(!showPassword);
                console.log('[SenhaField] Visibilidade da senha:', !showPassword ? 'MOSTRAR' : 'ESCONDER');
              }}
              edge="end"
              tabIndex={-1}
              sx={{ color: '#94a3b8' }}
            >
              {showPassword ? <VisibilityOff sx={{ fontSize: '1.2rem' }} /> : <Visibility sx={{ fontSize: '1.2rem' }} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
