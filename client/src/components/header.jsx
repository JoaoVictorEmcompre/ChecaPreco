import {Box, Typography} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Logo from '../assets/logo-bf-white.png';

export default function Header({username}) {
    return (
        <Box
            component="header"
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                columnGap: 1.5,
                background: 'linear-gradient(135deg, #CB3B31 0%, #a52a22 100%)',
                color: 'white',
                padding: {xs: '12px 16px', sm: '16px 30px'},
                borderRadius: '0 0 20px 20px',
                boxShadow: '0 4px 16px rgba(203, 59, 49, 0.25)',
            }}
        >
            {/* Esquerda: usuário */}
            <Box
                sx={{
                    justifySelf: 'start',
                    minWidth: 0,
                    maxWidth: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                }}
            >
                <PersonOutlineIcon sx={{fontSize: 18, flexShrink: 0}}/>
                <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{fontWeight: 500, lineHeight: 1.4}}
                >
                    {username || 'Olá'}
                </Typography>
            </Box>

            {/* Centro: logo */}
            <img src={Logo} alt="Bandfashion" style={{display: 'block', height: 36, width: 'auto'}}/>

            {/* Direita: espaço para equilibrar o centro */}
            <Box/>
        </Box>
    );
}
