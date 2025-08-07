import { useState, useEffect, useRef } from 'react';
import {
  Paper, InputBase, IconButton, Box, Dialog, DialogContent, Typography,
  Button, MenuItem, Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

export default function CampoDeBusca({ value, onChange, onSubmit }) {
  const [openScanner, setOpenScanner] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const inputRef = useRef(null);
  const alreadyDetected = useRef(false);

  // Função para envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[CampoDeBusca] Submit formulário com valor:', value);
    onSubmit(value);
  };

  // Cleanup completo do scanner e da câmera
  const stopScanner = async () => {
    alreadyDetected.current = false;
    try {
      if (codeReader.current) {
        if (typeof codeReader.current.reset === 'function') {
          await codeReader.current.reset();
          console.log('[CampoDeBusca] Scanner resetado');
        } else if (typeof codeReader.current.stopStreams === 'function') {
          codeReader.current.stopStreams();
          console.log('[CampoDeBusca] Scanner stopStreams executado');
        }
        codeReader.current = null;
      }
      const video = videoRef.current;
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        console.log('[CampoDeBusca] Tracks de vídeo paradas');
      }
    } catch (err) {
      console.error('[CampoDeBusca] Erro ao parar scanner:', err);
    }
  };

  // Inicializa o scanner para o deviceId selecionado
  const startScanner = async (deviceId) => {
    try {
      console.log('[CampoDeBusca] Iniciando scanner com deviceId:', deviceId);
      alreadyDetected.current = false;
      await stopScanner();

      if (!deviceId) {
        console.warn('[CampoDeBusca] Nenhum deviceId recebido para iniciar scanner');
        return;
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      codeReader.current = new BrowserMultiFormatReader(hints);

      await codeReader.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result) => {
          if (result && !alreadyDetected.current) {
            alreadyDetected.current = true;
            const texto = result.getText();
            console.log('[CampoDeBusca] Código detectado pelo scanner:', texto);
            onChange(texto);
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
              onSubmit(texto);
            }, 0);
            setOpenScanner(false);
          }
        }
      );
    } catch (err) {
      console.error('[CampoDeBusca] Erro ao iniciar scanner:', err);
      alert("Erro ao iniciar o scanner.");
    }
  };

  // Leitura por imagem
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = async () => {
      try {
        console.log('[CampoDeBusca] Imagem carregada para leitura do código');
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
        const reader = new BrowserMultiFormatReader(hints);
        const result = await reader.decodeFromImageElement(img);
        const texto = result.getText();
        console.log('[CampoDeBusca] Código detectado na imagem:', texto);
        onChange(texto);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
          onSubmit(texto);
        }, 0);
        setOpenScanner(false);
      } catch (err) {
        console.warn('[CampoDeBusca] Código não detectado na imagem.', err);
        alert("Não foi possível detectar um código de barras EAN-13 na imagem.");
      } finally {
        URL.revokeObjectURL(imageUrl); // Libera o recurso
        console.log('[CampoDeBusca] imageUrl liberado');
      }
    };
  };

  // Efetua cleanup sempre que o componente desmontar
  useEffect(() => {
    return () => {
      console.log('[CampoDeBusca] Componente desmontado, realizando cleanup do scanner');
      stopScanner();
    };
    // eslint-disable-next-line
  }, []);

  // Sempre que abrir o scanner, busca devices e define o default (mas NÃO starta scanner aqui)
  useEffect(() => {
    if (!openScanner) return;

    const fetchDevices = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        setVideoDevices(devices);
        console.log('[CampoDeBusca] Dispositivos de vídeo encontrados:', devices);
        if (devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        } else {
          alert('Nenhuma câmera encontrada.');
          setOpenScanner(false);
        }
      } catch (err) {
        console.error('[CampoDeBusca] Erro ao acessar câmeras:', err);
        alert("Erro ao acessar as câmeras.");
        setOpenScanner(false);
      }
    };
    fetchDevices();
    // Cleanup no fechamento do scanner
    return () => {
      console.log('[CampoDeBusca] Fechando scanner, realizando cleanup');
      stopScanner();
    };
    // eslint-disable-next-line
  }, [openScanner]);

  // Sempre que trocar o device, starta o scanner (se modal estiver aberto)
  useEffect(() => {
    if (selectedDeviceId && openScanner) {
      console.log('[CampoDeBusca] Troca de camera, deviceId:', selectedDeviceId);
      startScanner(selectedDeviceId);
    }
    // eslint-disable-next-line
  }, [selectedDeviceId, openScanner]);

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Paper
          component="form"
          sx={{
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            width: 360,
            borderRadius: 6,
            backgroundColor: '#f1f5f9'
          }}
          onSubmit={handleSubmit}
        >
          <InputBase
            inputRef={inputRef}
            sx={{ ml: 1, flex: 1, fontSize: 14 }}
            placeholder="Escaneie ou digite o código do item"
            inputProps={{ 'aria-label': 'campo de código de barras' }}
            value={value}
            onChange={(e) => {
              console.log('[CampoDeBusca] Input alterado:', e.target.value);
              onChange(e.target.value);
            }}
          />
          <IconButton
            sx={{ p: '10px' }}
            aria-label="Abrir câmera para leitura de código"
            onClick={() => {
              console.log('[CampoDeBusca] Botão de abrir câmera clicado');
              setOpenScanner(true);
            }}
          >
            <CameraAltIcon />
          </IconButton>
          <IconButton
            type="submit"
            sx={{ p: '10px' }}
            aria-label="Buscar item pelo código"
          >
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      <Dialog
        open={openScanner}
        onClose={() => {
          console.log('[CampoDeBusca] Fechando modal do scanner');
          stopScanner();
          setOpenScanner(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={() => {
              console.log('[CampoDeBusca] Botão fechar scanner clicado');
              stopScanner();
              setOpenScanner(false);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#f0f0f0',
              '&:hover': { backgroundColor: '#e0e0e0' },
              zIndex: 10,
            }}
            aria-label="Fechar scanner"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center', fontWeight: 600 }}>
            Posicione o código de barras no campo abaixo
          </Typography>

          {videoDevices.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Escolha a câmera:
              </Typography>
              <Select
                fullWidth
                value={selectedDeviceId}
                onChange={(e) => {
                  console.log('[CampoDeBusca] Troca de camera selecionada:', e.target.value);
                  setSelectedDeviceId(e.target.value);
                }}
                MenuProps={{ disablePortal: true }}
              >
                {videoDevices.map((device, idx) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Câmera ${idx + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 10,
              border: '2px solid #ddd',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
            tabIndex={-1}
            autoPlay
            muted
            playsInline
            aria-label="Visualização da câmera"
          />

          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <label htmlFor="upload-image" style={{ width: '100%' }}>
              <input
                accept="image/*"
                id="upload-image"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <Button
                variant="outlined"
                fullWidth
                component="span"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: 6,
                  borderColor: '#CB3B31',
                  color: '#CB3B31',
                  fontWeight: 600,
                  textAlign: 'center',
                  '&:hover': {
                    backgroundColor: '#fdecea',
                    borderColor: '#b71c1c',
                    color: '#b71c1c',
                  },
                }}
                aria-label="Carregar imagem do código"
              >
                Carregar Imagem do Código
              </Button>
            </label>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}