import { TextField, InputAdornment } from '@mui/material';
import { Person } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    '&:hover': { backgroundColor: '#eeeeee' },
    '&.Mui-focused': { backgroundColor: '#ffffff' },
  },
}));

export default function UsuarioField({ value, onChange, error, helperText, disabled }) {
  // Loga toda vez que o campo renderiza e mostra os principais props
  console.log('[UsuarioField] Render | value:', value, '| error:', error, '| disabled:', disabled);

  return (
    <StyledTextField
      fullWidth
      label="Usuário"
      value={value}
      onChange={e => {
        console.log('[UsuarioField] Input alterado:', e.target.value);
        onChange(e);
      }}
      error={!!error}
      helperText={helperText}
      placeholder="Digite seu usuário"
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Person color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}