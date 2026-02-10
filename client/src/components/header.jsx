import { Box, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/logo-bf-white.png';

export default function Header({ username, onLogout }) {
  console.log('[Header] Render - username:', username);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #CB3B31 0%, #a52a22 100%)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 20px rgba(203, 59, 49, 0.3)',
      }}
    >
      {/* Esquerda: Nome */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">
          olá
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
        {/* <IconButton
          onClick={() => {
            console.log('[Header] Logout clicado');
            onLogout();
          }}
          sx={{ color: 'white' }}
        >
          <LogoutIcon />
        </IconButton> */}
      </Box>
    </Box>
  );
}
