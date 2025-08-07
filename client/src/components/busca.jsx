import { useState, useEffect, useRef } from 'react';
import {
  Paper, InputBase, IconButton, Box, Dialog, DialogContent, Typography,
  Button, MenuItem, Select, CircularProgress
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const inputRef = useRef(null);
  const alreadyDetected = useRef(false);
  const currentStream = useRef(null);
  const initializationPromise = useRef(null);

  // Função para envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[CampoDeBusca] Submit formulário com valor:', value);
    onSubmit(value);
  };

  // Cleanup completo do scanner e da câmera
  const stopScanner = async () => {
    console.log('[CampoDeBusca] Iniciando stopScanner');
    alreadyDetected.current = false;
    setScannerReady(false);
    
    try {
      // Para o stream atual
      if (currentStream.current) {
        currentStream.current.getTracks().forEach((track) => {
          track.stop();
          console.log('[CampoDeBusca] Track parada:', track.label);
        });
        currentStream.current = null;
      }

      // Limpa o vídeo
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
        video.load(); // Força o reload do elemento video
      }

      // Para o code reader
      if (codeReader.current) {
        try {
          if (typeof codeReader.current.reset === 'function') {
            await codeReader.current.reset();
          }
          if (typeof codeReader.current.stopContinuousDecode === 'function') {
            codeReader.current.stopContinuousDecode();
          }
        } catch (err) {
          console.warn('[CampoDeBusca] Erro ao resetar codeReader:', err);
        }
        codeReader.current = null;
      }

      console.log('[CampoDeBusca] Scanner completamente parado');
    } catch (err) {
      console.error('[CampoDeBusca] Erro ao parar scanner:', err);
    }
  };

  // Inicializa o scanner para o deviceId selecionado
  const startScanner = async (deviceId) => {
    if (!deviceId || !openScanner) {
      console.warn('[CampoDeBusca] Device ID inválido ou scanner fechado');
      return;
    }

    console.log('[CampoDeBusca] Iniciando scanner com deviceId:', deviceId);
    setIsInitializing(true);
    alreadyDetected.current = false;
    
    try {
      // Para qualquer scanner anterior
      await stopScanner();

      // Aguarda um pouco para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 200));

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      codeReader.current = new BrowserMultiFormatReader(hints);

      // Primeiro, obtém acesso à câmera
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          facingMode: 'environment', // Preferência por câmera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream.current = stream;
      
      // Configura o vídeo
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        
        // Aguarda o vídeo estar realmente pronto
        await new Promise(resolve => {
          const checkReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      setScannerReady(true);
      console.log('[CampoDeBusca] Vídeo inicializado, iniciando decodificação');

      // Agora inicia a decodificação contínua
      codeReader.current.decodeFromVideoDevice(
        deviceId,
        video,
        (result, error) => {
          if (result && !alreadyDetected.current) {
            alreadyDetected.current = true;
            const texto = result.getText();
            console.log('[CampoDeBusca] Código detectado pelo scanner:', texto);
            onChange(texto);
            
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
              onSubmit(texto);
              setOpenScanner(false);
            }, 100);
          }
          
          // Só loga erros que não sejam "código não encontrado"
          if (error && error.name !== 'NotFoundException' && 
              !error.message?.includes('No MultiFormat Readers were able to detect the code')) {
            console.warn('[CampoDeBusca] Erro na decodificação:', error.message);
          }
        }
      );
      
    } catch (err) {
      console.error('[CampoDeBusca] Erro ao iniciar scanner:', err);
      
      let errorMessage = "Erro ao iniciar o scanner.";
      if (err.name === 'NotAllowedError') {
        errorMessage = "Permissão negada para acessar a câmera.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Câmera não encontrada.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Câmera está sendo usada por outro aplicativo.";
      }
      
      alert(errorMessage);
      setScannerReady(false);
      setOpenScanner(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Leitura por imagem
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[CampoDeBusca] Processando imagem carregada');
    const imageUrl = URL.createObjectURL(file);
    const img = new window.Image();
    
    img.onload = async () => {
      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        
        const reader = new BrowserMultiFormatReader(hints);
        const result = await reader.decodeFromImageElement(img);
        const texto = result.getText();
        
        console.log('[CampoDeBusca] Código detectado na imagem:', texto);
        onChange(texto);
        
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
          onSubmit(texto);
          setOpenScanner(false);
        }, 100);
        
      } catch (err) {
        console.warn('[CampoDeBusca] Código não detectado na imagem:', err);
        alert("Não foi possível detectar um código de barras EAN-13 na imagem.");
      } finally {
        URL.revokeObjectURL(imageUrl);
        console.log('[CampoDeBusca] Recurso de imagem liberado');
      }
    };
    
    img.onerror = () => {
      console.error('[CampoDeBusca] Erro ao carregar imagem');
      URL.revokeObjectURL(imageUrl);
      alert("Erro ao carregar a imagem.");
    };
    
    img.src = imageUrl;
    
    // Limpa o input para permitir upload da mesma imagem novamente
    event.target.value = '';
  };

  // Busca dispositivos de vídeo
  const fetchVideoDevices = async () => {
    try {
      console.log('[CampoDeBusca] Solicitando permissão para câmera...');
      
      // Primeiro solicita permissão
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Para o stream de teste imediatamente
          stream.getTracks().forEach(track => track.stop());
        });

      console.log('[CampoDeBusca] Permissão concedida, buscando dispositivos...');
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (devices.length === 0) {
        console.warn('[CampoDeBusca] Nenhum dispositivo de vídeo encontrado');
        alert('Nenhuma câmera encontrada.');
        setOpenScanner(false);
        return;
      }
      
      console.log('[CampoDeBusca] Dispositivos encontrados:', devices);
      setVideoDevices(devices);
      
      // No mobile, prefere câmera traseira se disponível
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('traseira') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const defaultDevice = backCamera || devices[0];
      setSelectedDeviceId(defaultDevice.deviceId);
      
    } catch (err) {
      console.error('[CampoDeBusca] Erro ao buscar dispositivos:', err);
      
      let errorMessage = "Erro ao acessar as câmeras.";
      if (err.name === 'NotAllowedError') {
        errorMessage = "Permissão negada para acessar a câmera. Verifique as configurações do navegador.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Nenhuma câmera encontrada no dispositivo.";
      }
      
      alert(errorMessage);
      setOpenScanner(false);
    }
  };

  // Cleanup no desmonte do componente
  useEffect(() => {
    return () => {
      console.log('[CampoDeBusca] Desmontando componente');
      stopScanner();
    };
  }, []);

  // Gerencia abertura/fechamento do scanner
  useEffect(() => {
    if (openScanner) {
      console.log('[CampoDeBusca] Abrindo scanner');
      alreadyDetected.current = false; // Reset da detecção
      fetchVideoDevices();
    } else {
      console.log('[CampoDeBusca] Fechando scanner');
      stopScanner();
      // Reset dos estados
      setVideoDevices([]);
      setSelectedDeviceId('');
      setScannerReady(false);
      setIsInitializing(false);
    }
  }, [openScanner]);

  // Inicia scanner quando device é selecionado
  useEffect(() => {
    if (selectedDeviceId && openScanner && videoDevices.length > 0 && !isInitializing) {
      console.log('[CampoDeBusca] Iniciando scanner para device:', selectedDeviceId);
      startScanner(selectedDeviceId);
    }
  }, [selectedDeviceId, openScanner, videoDevices]);

  const handleCloseScanner = () => {
    console.log('[CampoDeBusca] Fechando scanner via botão');
    setOpenScanner(false);
  };

  const handleOpenScanner = () => {
    console.log('[CampoDeBusca] Abrindo scanner via botão');
    setOpenScanner(true);
  };

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
            onClick={handleOpenScanner}
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
        onClose={handleCloseScanner}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isInitializing}
      >
        <DialogContent sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={handleCloseScanner}
            disabled={isInitializing}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#f0f0f0',
              '&:hover': { backgroundColor: '#e0e0e0' },
              '&:disabled': { backgroundColor: '#f5f5f5' },
              zIndex: 10,
            }}
            aria-label="Fechar scanner"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center', fontWeight: 600 }}>
            Posicione o código de barras no campo abaixo
          </Typography>

          {/* Seletor de câmera */}
          {videoDevices.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Escolha a câmera:
              </Typography>
              <Select
                fullWidth
                value={selectedDeviceId}
                onChange={(e) => {
                  console.log('[CampoDeBusca] Câmera selecionada:', e.target.value);
                  setSelectedDeviceId(e.target.value);
                }}
                disabled={isInitializing}
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

          {/* Loading indicator */}
          {isInitializing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1, alignSelf: 'center' }}>
                Inicializando câmera...
              </Typography>
            </Box>
          )}

          {/* Vídeo */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 10,
              border: '2px solid #ddd',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              backgroundColor: '#000',
              minHeight: '200px',
              opacity: scannerReady ? 1 : 0.5
            }}
            autoPlay
            muted
            playsInline
            aria-label="Visualização da câmera"
          />

          {/* Status do scanner */}
          {!isInitializing && !scannerReady && videoDevices.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'warning.main' }}>
              Aguardando inicialização da câmera...
            </Typography>
          )}

          {scannerReady && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'success.main' }}>
              Câmera pronta! Posicione o código de barras na tela.
            </Typography>
          )}

          {/* Botão de upload */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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
                disabled={isInitializing}
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
                  '&:disabled': {
                    borderColor: '#ccc',
                    color: '#ccc',
                  }
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