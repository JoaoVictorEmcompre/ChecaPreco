import {useState} from 'react';
import {Box, Button, CircularProgress, Typography} from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

// Qualquer resposta HTTP (até 404) prova que a rede chegou ao servidor; só falha de rede conta como offline
async function temConexao() {
    try {
        await fetch(`/api/?_=${Date.now()}`, {cache: 'no-store'});
        return true;
    } catch {
        return false;
    }
}

export default function SemConexao({onReconectou}) {
    const [verificando, setVerificando] = useState(false);
    const [aindaOffline, setAindaOffline] = useState(false);

    const tentarNovamente = async () => {
        setVerificando(true);
        setAindaOffline(false);
        const ok = await temConexao();
        setVerificando(false);
        if (ok) onReconectou();
        else setAindaOffline(true);
    };

    return (
        <Box
            role="alert"
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                backgroundColor: '#f7f7f8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                gap: 2,
            }}
        >
            <Box
                sx={{
                    width: 96, height: 96, borderRadius: '50%',
                    backgroundColor: '#fdecea', color: '#CB3B31',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <WifiOffIcon sx={{fontSize: 48}}/>
            </Box>

            <Typography variant="h6" sx={{fontWeight: 600, color: '#222'}}>
                Sem conexão com a internet
            </Typography>
            <Typography variant="body1" sx={{color: '#667085', maxWidth: 320}}>
                Conecte-se ao Wi-Fi e tente novamente.
            </Typography>

            {aindaOffline && (
                <Typography variant="body2" sx={{color: '#CB3B31', fontWeight: 600}}>
                    Ainda sem conexão.
                </Typography>
            )}

            <Button
                variant="contained"
                onClick={tentarNovamente}
                disabled={verificando}
                startIcon={verificando ? <CircularProgress size={18} color="inherit"/> : <RefreshIcon/>}
                sx={{borderRadius: 999, px: 3, py: 1, textTransform: 'none', fontWeight: 600, fontSize: 15}}
            >
                Tentar novamente
            </Button>
        </Box>
    );
}
