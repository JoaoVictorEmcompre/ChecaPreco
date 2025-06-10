import { useState, useEffect, useRef } from 'react';
import { Paper, InputBase, IconButton, Box, Dialog, DialogContent, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function CampoDeBusca({ value, onChange, onSubmit }) {
  const [openScanner, setOpenScanner] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const stopScanner = async () => {
    try {
      if (codeReader.current) {
        await codeReader.current.reset();
        codeReader.current = null;
      }

      const video = videoRef.current;
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }

      setOpenScanner(false);
    } catch (err) {
      console.error("Erro ao parar scanner:", err);
      setOpenScanner(false);
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
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageElement(img);
          const texto = result.getText();
          onChange(texto);
          setTimeout(() => {
            onSubmit();
          }, 0);
          setOpenScanner(false);
        } catch (err) {
          console.warn("Código não detectado na imagem.");
          alert("Não foi possível detectar um código de barras na imagem.");
        }
      };
    } catch (err) {
      console.error("Erro ao carregar imagem:", err);
    }
  };

  useEffect(() => {
    if (!openScanner) return;

    const initScanner = async () => {
      try {
        codeReader.current = new BrowserMultiFormatReader();

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) {
          alert("Nenhuma câmera foi detectada.");
          setOpenScanner(false);
          return;
        }

        const selectedDeviceId = devices[0].deviceId;

        await codeReader.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          async (result, err) => {
            if (result) {
              const texto = result.getText();
              onChange(texto);
              setTimeout(() => {
                onSubmit();
              }, 0);
              await stopScanner();
            }
          }
        );
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
        alert("Erro ao iniciar o scanner.");
        setOpenScanner(false);
      }
    };

    initScanner();
  }, [openScanner]);

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

      <Dialog open={openScanner} onClose={stopScanner} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
            Posicione o código de barras na área abaixo
          </Typography>

          <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />

          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant="contained"
              onClick={stopScanner}
              sx={{
                backgroundColor: '#CB3B31',
                color: '#fff',
                px: 3,
                py: 1,
                borderRadius: 3,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#b71c1c'
                }
              }}
            >
              Fechar Scanner
            </Button>

            <label htmlFor="upload-image">
              <input
                accept="image/*"
                id="upload-image"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <Button
                variant="contained"
                component="span"
                sx={{
                  backgroundColor: '#CB3B31',
                  color: '#fff',
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#b71c1c'
                  }
                }}
              >
                Carregar Imagem
              </Button>
            </label>
          </Box>

        </DialogContent>
      </Dialog>
    </>
  );
}