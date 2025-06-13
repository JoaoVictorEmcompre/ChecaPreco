import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    '&:hover': { backgroundColor: '#eeeeee' },
    '&.Mui-focused': { backgroundColor: '#ffffff' },
  },
}));

export default function SenhaField({ value, onChange, error, helperText, disabled }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <StyledTextField
      fullWidth
      label="Senha"
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={helperText}
      placeholder="Digite sua senha"
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock color="action" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
