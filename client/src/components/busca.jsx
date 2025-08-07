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
    onSubmit(value);
  };

  // Cleanup completo do scanner e da câmera
  const stopScanner = async () => {
    try {
      if (codeReader.current) {
        if (typeof codeReader.current.reset === 'function') {
          await codeReader.current.reset();
        } else if (typeof codeReader.current.stopStreams === 'function') {
          codeReader.current.stopStreams();
        }
        codeReader.current = null;
      }
      const video = videoRef.current;
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    } catch (err) {
      // ignore
    }
  };

  // Inicializa o scanner para o deviceId selecionado (correção aqui!)
  const startScanner = async (deviceId) => {
    try {
      await stopScanner();
      // Delay para garantir o "buffer limpo" e resetar a flag só depois
      setTimeout(async () => {
        alreadyDetected.current = false; // Só reseta aqui!
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
              onChange(texto);
              setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
                onSubmit(texto);
              }, 0);
              setOpenScanner(false);
            }
          }
        );
      }, 300); // 300ms, pode ajustar se quiser
    } catch (err) {
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
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
        const reader = new BrowserMultiFormatReader(hints);
        const result = await reader.decodeFromImageElement(img);
        const texto = result.getText();
        onChange(texto);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
          onSubmit(texto);
        }, 0);
        setOpenScanner(false);
      } catch (err) {
        alert("Não foi possível detectar um código de barras EAN-13 na imagem.");
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    };
  };

  // Cleanup sempre ao desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line
  }, []);

  // Busca devices ao abrir scanner
  useEffect(() => {
    if (!openScanner) return;

    const fetchDevices = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        setVideoDevices(devices);
        if (devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        } else {
          alert('Nenhuma câmera encontrada.');
          setOpenScanner(false);
        }
      } catch (err) {
        alert("Erro ao acessar as câmeras.");
        setOpenScanner(false);
      }
    };
    fetchDevices();
    // Cleanup ao fechar scanner
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line
  }, [openScanner]);

  // Start scanner ao trocar device ou abrir modal
  useEffect(() => {
    if (selectedDeviceId && openScanner) {
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
            onChange={(e) => onChange(e.target.value)}
          />
          <IconButton
            sx={{ p: '10px' }}
            aria-label="Abrir câmera para leitura de código"
            onClick={() => {
              onChange(''); // Limpa o campo ao abrir scanner (opcional, pode tirar)
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
          stopScanner();
          setOpenScanner(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={() => {
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
                onChange={(e) => setSelectedDeviceId(e.target.value)}
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