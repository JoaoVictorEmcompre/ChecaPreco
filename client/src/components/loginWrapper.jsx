import { Paper, Typography } from '@mui/material';
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
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
}));

export default function LoginWrapper({ children }) {
  return (
    <StyledPaper elevation={6}>
      <img
        src={Logo}
        alt="Bandfashion Logo"
        style={{
          width: '80px',
          marginBottom: '1.5rem',
          marginTop: '-0.5rem',
          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.15))'
        }}
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#CB3B31',
          textAlign: 'center',
          marginBottom: '1rem'
        }}
      >
        Entrar na Conta
      </Typography>
      {children}
    </StyledPaper>
  );
}
