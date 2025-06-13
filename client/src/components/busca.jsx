import { useState, useEffect, useRef } from 'react';
import {
  Paper, InputBase, IconButton, Box, Dialog, DialogContent, Typography, Button, MenuItem, Select
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  const stopScanner = async () => {
    alreadyDetected.current = false;
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
      console.error("Erro ao parar scanner:", err);
    }
  };

  const startScanner = async (deviceId) => {
    try {
      alreadyDetected.current = false;
      await stopScanner();

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      codeReader.current = new BrowserMultiFormatReader(hints);

      await codeReader.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        async (result, err) => {
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
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      alert("Erro ao iniciar o scanner.");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
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
          console.warn("Código não detectado na imagem.");
          alert("Não foi possível detectar um código de barras EAN-13 na imagem.");
        }
      };
    } catch (err) {
      console.error("Erro ao carregar imagem:", err);
    }
  };

  useEffect(() => {
    if (!openScanner) return;

    const fetchDevicesAndStart = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        setVideoDevices(devices);

        const defaultDevice = devices[0];
        setSelectedDeviceId(defaultDevice.deviceId);
        await startScanner(defaultDevice.deviceId);
      } catch (err) {
        console.error("Erro ao acessar câmeras:", err);
        alert("Erro ao acessar as câmeras.");
        setOpenScanner(false);
      }
    };

    fetchDevicesAndStart();
  }, [openScanner]);

  useEffect(() => {
    if (selectedDeviceId && openScanner) {
      startScanner(selectedDeviceId);
    }
  }, [selectedDeviceId]);

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
            inputProps={{ 'aria-label': 'código de barras' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }} aria-label="camera" onClick={() => setOpenScanner(true)}>
            <CameraAltIcon />
          </IconButton>
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      <Dialog open={openScanner} onClose={() => { stopScanner(); setOpenScanner(false); }} maxWidth="sm" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={() => { stopScanner(); setOpenScanner(false); }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#f0f0f0',
              '&:hover': { backgroundColor: '#e0e0e0' },
              zIndex: 10,
            }}
            aria-label="Fechar"
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