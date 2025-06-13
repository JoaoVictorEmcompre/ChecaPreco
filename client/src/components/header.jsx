import { Box, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/logo-bf-white.png';

export default function Header({ username, onLogout }) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#CB3B31',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '0 0 8px 8px',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {/* Esquerda: Nome */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">
          Olá, <strong>{username}</strong>
        </Typography>
      </Box>

      {/* Centro: Logo centralizada absoluta */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <img src={Logo} alt="Logo" style={{ maxHeight: 40 }} />
      </Box>

      {/* Direita: Botão */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onLogout} sx={{ color: 'white' }}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
}