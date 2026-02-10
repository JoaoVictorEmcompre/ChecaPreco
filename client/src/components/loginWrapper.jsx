import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Logo from '../assets/logo-bf-red.png';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
  borderRadius: 24,
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
}));

export default function LoginWrapper({ children }) {
  console.log('[LoginWrapper] Renderizado | children:', Array.isArray(children) ? children.length : 1);

  return (
    <StyledPaper elevation={0}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '18px',
          bgcolor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          mt: -0.5,
        }}
      >
        <img
          src={Logo}
          alt="Bandfashion Logo"
          style={{
            width: '48px',
          }}
        />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#1a1a2e',
          textAlign: 'center',
          marginBottom: '0.5rem',
          fontSize: '1.5rem',
        }}
      >
        Entrar na Conta
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#94a3b8',
          textAlign: 'center',
          mb: 3,
        }}
      >
        Acesse sua conta para consultar precos
      </Typography>
      {children}
    </StyledPaper>
  );
}
