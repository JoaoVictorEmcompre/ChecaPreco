import { Box, Typography, IconButton, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/logo-bf-white.png';

export default function Header({ username, onLogout }) {
  console.log('[Header] Render - username:', username);

  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #CB3B31 0%, #a52a22 100%)',
        color: 'white',
        padding: '14px 20px',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 20px rgba(203, 59, 49, 0.3)',
      }}
    >
      {/* Left: User avatar + greeting */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          {initial}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.2 }}>
            Bem-vindo
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
            {username || 'Visitante'}
          </Typography>
        </Box>
      </Box>

      {/* Center: Logo */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            maxHeight: 36,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
      </Box>

      {/* Right: Logout button */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          onClick={() => {
            console.log('[Header] Logout clicado');
            onLogout();
          }}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.12)',
            width: 38,
            height: 38,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <LogoutIcon sx={{ fontSize: '1.15rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
}
