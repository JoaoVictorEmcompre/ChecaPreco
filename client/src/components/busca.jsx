import { useState, useEffect, useRef } from "react";
import { Paper, InputBase, IconButton, Box, Dialog, DialogContent, Typography, Button, MenuItem, Select, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { BrowserMultiFormatReader, BrowserCodeReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

export default function CampoDeBusca({ value, onChange, onSubmit, onActivate }) {
  const [openScanner, setOpenScanner] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const controlsRef = useRef(null);
  const inputRef = useRef(null);
  const alreadyDetected = useRef(false);
  const isStartingRef = useRef(false);

  const acceptAfterTS = useRef(0);
  const lastConfirmed = useRef("");

  const listVideoInputDevicesSafe = async () => {
    if (typeof BrowserCodeReader?.listVideoInputDevices === "function") {
      return BrowserCodeReader.listVideoInputDevices();
    }
    if (typeof BrowserMultiFormatReader?.listVideoInputDevices === "function") {
      return BrowserMultiFormatReader.listVideoInputDevices();
    }
    const all = await navigator.mediaDevices.enumerateDevices();
    return all.filter((d) => d.kind === "videoinput");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onActivate?.(false);
    onSubmit(value);
  };

  const handleFocus = () => onActivate?.(false);

  const handleChange = (e) => {
    onActivate?.(false);
    onChange(e.target.value);
  };

  const stopScanner = async () => {
    console.log("[CampoDeBusca] stopScanner");
    alreadyDetected.current = false;
    setScannerReady(false);
    try {
      if (
        controlsRef.current &&
        typeof controlsRef.current.stop === "function"
      ) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      if (codeReader.current?.reset) {
        await codeReader.current.reset();
      }
      const video = videoRef.current;
      if (video) {
        if (video.srcObject) {
          try {
            video.srcObject.getTracks?.().forEach((t) => t.stop());
          } catch { }
          video.srcObject = null;
        }
        video.removeAttribute?.("src");
        video.load?.();
      }
      codeReader.current = null;
      console.log("[CampoDeBusca] Scanner completamente parado");
    } catch (err) {
      console.error("[CampoDeBusca] Erro ao parar scanner:", err);
    }
  };
  const startScanner = async (deviceId) => {
    if (!deviceId || !openScanner) {
      console.warn("[CampoDeBusca] Device ID invalido ou scanner fechado");
      return;
    }
    if (isStartingRef.current) {
      console.log("[CampoDeBusca] startScanner ignorado: ja iniciando");
      return;
    }
    isStartingRef.current = true;
    console.log("[CampoDeBusca] startScanner deviceId:", deviceId);
    setIsInitializing(true);
    alreadyDetected.current = false;
    try {
      if (controlsRef.current) {
        await stopScanner();
      }
      await new Promise((r) => setTimeout(r, 120));
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      codeReader.current = new BrowserMultiFormatReader(hints);
      const video = videoRef.current;
      if (video) {
        const markReady = () => setScannerReady(true);
        video.onloadedmetadata = markReady;
        video.onloadeddata = markReady;
      }
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      let lastFrameText = "";
      let lastFrameCount = 0;
      controlsRef.current = await codeReader.current.decodeFromConstraints(
        constraints,
        video,
        (result, error) => {
          if (result) {
            const texto = result.getText();
            if (Date.now() < acceptAfterTS.current) return;
            if (texto === lastFrameText) {
              lastFrameCount += 1;
            } else {
              lastFrameText = texto;
              lastFrameCount = 1;
            }
            if (lastFrameCount < 2) return;
            if (alreadyDetected.current) return;
            if (texto === value) return;
            if (texto === lastConfirmed.current) return;
            console.log("[CampoDeBusca] Codigo detectado:", texto);
            alreadyDetected.current = true;
            onChange(texto);
            setTimeout(() => {
              onActivate?.(false);
              inputRef.current?.focus?.();
              onSubmit(texto);
              lastConfirmed.current = texto;
              setOpenScanner(false);
            }, 100);
          }
          if (
            error &&
            error.name !== "NotFoundException" &&
            !error.message?.includes(
              "No MultiFormat Readers were able to detect the code"
            )
          ) {
            console.warn(
              "[CampoDeBusca] Erro na decodificacao:",
              error.message
            );
          }
        }
      );
      console.log("[CampoDeBusca] decodeFromConstraints iniciado");
    } catch (err) {
      console.error("[CampoDeBusca] Erro ao iniciar scanner:", err);
      let errorMessage = "Erro ao iniciar o scanner.";
      if (err.name === "NotAllowedError")
        errorMessage = "Permissao negada para acessar a camera.";
      else if (err.name === "NotFoundError")
        errorMessage = "Camera nao encontrada.";
      else if (err.name === "NotReadableError")
        errorMessage = "Camera esta sendo usada por outro aplicativo.";
      alert(errorMessage);
      setScannerReady(false);
      setOpenScanner(false);
    } finally {
      setIsInitializing(false);
      isStartingRef.current = false;
    }
  };
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    console.log("[CampoDeBusca] Processando imagem carregada");
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
        if (texto === value || texto === lastConfirmed.current) {
          console.log("[CampoDeBusca] Imagem com codigo duplicado, ignorando.");
          return;
        }
        console.log("[CampoDeBusca] Codigo detectado na imagem:", texto);
        onChange(texto);
        setTimeout(() => {
          inputRef.current?.focus?.();
          onSubmit(texto);
          lastConfirmed.current = texto;
          setOpenScanner(false);
        }, 100);
      } catch (err) {
        console.warn("[CampoDeBusca] Codigo nao detectado na imagem:", err);
        alert(
          "Nao foi possivel detectar um codigo de barras EAN-13 na imagem."
        );
      } finally {
        URL.revokeObjectURL(imageUrl);
        console.log("[CampoDeBusca] Recurso de imagem liberado");
      }
    };
    img.onerror = () => {
      console.error("[CampoDeBusca] Erro ao carregar imagem");
      URL.revokeObjectURL(imageUrl);
      alert("Erro ao carregar a imagem.");
    };
    img.src = imageUrl;
    event.target.value = "";
  };
  const fetchVideoDevices = async () => {
    try {
      console.log("[CampoDeBusca] Solicitando permissao para camera...");
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true });
      tmp.getTracks().forEach((t) => t.stop());
      console.log(
        "[CampoDeBusca] Permissao concedida, buscando dispositivos..."
      );
      const devices = await listVideoInputDevicesSafe();
      if (!devices || devices.length === 0) {
        console.warn("[CampoDeBusca] Nenhum dispositivo de video encontrado");
        alert("Nenhuma camera encontrada.");
        setOpenScanner(false);
        return;
      }
      setVideoDevices(devices);
      const backCamera = devices.find(
        (device) =>
          (device.label || "").toLowerCase().includes("back") ||
          (device.label || "").toLowerCase().includes("traseira") ||
          (device.label || "").toLowerCase().includes("environment")
      );
      const defaultDevice = backCamera || devices[0];
      setSelectedDeviceId(defaultDevice.deviceId);
    } catch (err) {
      console.error("[CampoDeBusca] Erro ao buscar dispositivos:", err);
      let errorMessage = "Erro ao acessar as cameras.";
      if (err.name === "NotAllowedError")
        errorMessage =
          "Permissao negada para acessar a camera. Verifique as configuracoes do navegador.";
      else if (err.name === "NotFoundError")
        errorMessage = "Nenhuma camera encontrada no dispositivo.";
      alert(errorMessage);
      setOpenScanner(false);
    }
  };
  useEffect(() => {
    return () => {
      console.log("[CampoDeBusca] Desmontando componente");
      stopScanner();
    };
  }, []);
  useEffect(() => {
    if (openScanner) {
      console.log("[CampoDeBusca] Abrindo scanner");
      alreadyDetected.current = false;
      lastConfirmed.current = "";
      onChange("");
      acceptAfterTS.current = Date.now() + 500;
      fetchVideoDevices();
    } else {
      console.log("[CampoDeBusca] Fechando scanner");
      stopScanner();
      setVideoDevices([]);
      setSelectedDeviceId("");
      setScannerReady(false);
      setIsInitializing(false);
    }
  }, [openScanner]);
  useEffect(() => {
    if (selectedDeviceId && openScanner && videoDevices.length > 0) {
      console.log(
        "[CampoDeBusca] Dispositivo mudou ou scanner abriu. Reiniciando para o device:",
        selectedDeviceId
      );
      startScanner(selectedDeviceId);
    }
  }, [selectedDeviceId, openScanner, videoDevices]);


  const handleCloseScanner = () => setOpenScanner(false);
  const handleOpenScanner = () => {
    onActivate?.(false);
    setOpenScanner(true);
  }

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: '100%', maxWidth: 400, mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              ml: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: '0.9rem' }} />
            Codigo do Item
          </Typography>
        </Box>
        <Paper
          component="form"
          sx={{
            p: "4px 6px",
            display: "flex",
            alignItems: "center",
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            backgroundColor: '#fff',
            border: '1.5px solid #e2e8f0',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: '#CB3B31',
              boxShadow: '0 0 0 3px rgba(203, 59, 49, 0.1)',
            },
          }}
          onSubmit={handleSubmit}
        >
          <InputBase
            inputRef={inputRef}
            sx={{ ml: 1.5, flex: 1, fontSize: '0.875rem' }}
            placeholder="Escaneie ou digite o codigo"
            inputProps={{ "aria-label": "campo de codigo de barras" }}
            value={value}
            onFocus={handleFocus}
            onChange={handleChange}
          />

          <IconButton
            sx={{
              p: "8px",
              color: '#64748b',
              '&:hover': { color: '#CB3B31', bgcolor: 'rgba(203, 59, 49, 0.08)' },
              transition: 'all 0.2s ease',
            }}
            aria-label="Abrir camera para leitura de codigo"
            onClick={handleOpenScanner}
          >
            <CameraAltIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>

          <IconButton
            type="submit"
            sx={{
              p: '8px',
              color: '#CB3B31',
              bgcolor: 'rgba(203, 59, 49, 0.08)',
              '&:hover': { bgcolor: 'rgba(203, 59, 49, 0.15)' },
            }}
            aria-label="Buscar item pelo codigo"
          >
            <SearchIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Paper>
      </Box>

      <Dialog
        open={openScanner}
        onClose={handleCloseScanner}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isInitializing}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          }
        }}
      >

        <DialogContent sx={{ position: "relative", p: 3 }}>

          <IconButton
            onClick={handleCloseScanner}
            disabled={isInitializing}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.05)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
              "&:disabled": { backgroundColor: "#f5f5f5" },
              zIndex: 10,
            }}
            aria-label="Fechar scanner"
          >
            <CloseIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>

          <Typography
            variant="h3"
            sx={{ mt: 2, mb: 2, textAlign: "center" }}
          >
            Posicione o codigo de barras
          </Typography>

          {videoDevices.length > 1 && (
            <Box sx={{ mb: 2 }}>

              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600, color: 'text.secondary' }}>
                Escolha a camera:
              </Typography>

              <Select
                fullWidth
                size="small"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={isInitializing}
                MenuProps={{ disablePortal: true }}
                sx={{ borderRadius: 2 }}
              >

                {videoDevices.map((device, idx) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}

                  </MenuItem>
                ))}

              </Select>

            </Box>
          )}

          {isInitializing && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: 'center', mb: 2, gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#CB3B31' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Inicializando camera...
              </Typography>
            </Box>
          )}

          <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '2px solid #e2e8f0', position: 'relative' }}>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "auto",
                display: 'block',
                backgroundColor: "#111",
                minHeight: "200px",
                opacity: scannerReady ? 1 : 0.4,
                transition: 'opacity 0.3s ease',
              }}
              autoPlay
              muted
              playsInline
              aria-label="Visualizacao da camera"
            />
            {scannerReady && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '70%',
                height: '40%',
                border: '2px solid rgba(203, 59, 49, 0.6)',
                borderRadius: 2,
                pointerEvents: 'none',
              }} />
            )}
          </Box>

          {!isInitializing && !scannerReady && videoDevices.length > 0 && (
            <Typography
              variant="body2"
              sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}
            >
              Aguardando camera...
            </Typography>
          )}

          {scannerReady && (
            <Typography
              variant="body2"
              sx={{ mt: 1.5, textAlign: "center", color: "success.main", fontWeight: 500 }}
            >
              Camera pronta! Posicione o codigo de barras.
            </Typography>
          )}

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >

            <label htmlFor="upload-image" style={{ width: "100%" }}>

              <input
                accept="image/*"
                id="upload-image"
                type="file"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <Button
                variant="outlined"
                fullWidth
                component="span"
                startIcon={<UploadIcon />}
                disabled={isInitializing}
                sx={{
                  borderRadius: 3,
                  borderColor: "#e2e8f0",
                  borderWidth: '1.5px',
                  color: "#64748b",
                  fontWeight: 600,
                  py: 1.2,
                  "&:hover": {
                    backgroundColor: "rgba(203, 59, 49, 0.04)",
                    borderColor: "#CB3B31",
                    color: "#CB3B31",
                  },
                  "&:disabled": {
                    borderColor: "#eee",
                    color: "#ccc",
                  },
                }}
                aria-label="Carregar imagem do codigo"
              >
                Carregar Imagem do Codigo
              </Button>

            </label>

          </Box>

        </DialogContent>

      </Dialog>
    </>
  );
}
