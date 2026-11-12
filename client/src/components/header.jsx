import {Box, Button, SvgIcon, Typography} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Logo from '../assets/logo-bf-white.png';

// O @mui/icons-material não tem borracha; ícone "eraser" do Material Design Icons
function BorrachaIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M16.24 3.56 21.19 8.5c.78.79.78 2.05 0 2.84L12 20.53c-1.56 1.56-4.09 1.56-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84L13.41 3.56c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l4.24-4.24-4.24-4.24-6.37 4.95z"/>
        </SvgIcon>
    );
}

export default function Header({username, onLimpar, disabled}) {
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
                // topo extra = barra de status do iPhone (0 onde não existe), para o degradê cobri-la
                padding: {xs: '12px 16px', sm: '16px 30px'},
                paddingTop: {
                    xs: 'calc(12px + env(safe-area-inset-top))',
                    sm: 'calc(16px + env(safe-area-inset-top))',
                },
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

            {/* Direita: limpar busca */}
            <Box sx={{justifySelf: 'end', minWidth: 0}}>
                {onLimpar && (
                    <Button
                        onClick={onLimpar}
                        disabled={disabled}
                        startIcon={<BorrachaIcon/>}
                        aria-label="Limpar busca"
                        sx={{
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: 999,
                            px: {xs: 1, sm: 1.5},
                            minWidth: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                            '&:hover': {backgroundColor: 'rgba(255, 255, 255, 0.28)'},
                            '&.Mui-disabled': {color: 'rgba(255, 255, 255, 0.5)'},
                            fontSize: {xs: 13, sm: 14},
                            '& .MuiButton-startIcon': {mr: 0.5, ml: 0},
                        }}
                    >
                        Limpar
                    </Button>
                )}
            </Box>
        </Box>
    );
}
