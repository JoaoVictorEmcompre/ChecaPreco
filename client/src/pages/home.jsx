import React, { useState, useEffect } from "react";
import { Typography, Box, Chip } from "@mui/material";
import CampoDeBusca from "../components/busca";
import CampoDeBuscaGrupo from "../components/buscaGrupo";
import TabelaEstoque from "../components/tabela";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { getPrecoPorGrupo } from "../service/price.services";
import { getEstoque } from "../service/stock.services";
import { getSku } from "../service/ean";
import { loginAutomatico } from "../service/login.services";
import BuscaDesc from "../components/buscaDesc";
import { getDesc } from "../service/cnpj.services";
import { getCombo } from "../service/combo.services";

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [ean, setEan] = useState("");
  const [gp, setGp] = useState("");
  const [submittedEan, setSubmittedEan] = useState("");
  const [estoque, setEstoque] = useState([]);
  const [preco, setPreco] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cnpj, setCnpj] = useState("");
  const [desc, setDesc] = useState("");
  const [submittedCnpj, setSubmittedCnpj] = useState("");
  const [msgErro, setMsgErro] = useState("");
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    console.log("[useEffect] Verificando username em sessionStorage...");
    const user = sessionStorage.getItem("username");
    if (!user) {
      // navigate('/Login'); ATIVAR NOVAMENTE QUANDO VOLTAR O LOGIN
      // LOGIN AUTOMATICO
      console.log("[useEffect] Sem usuario logado, executando loginAutomatico");
      loginAutomatico().then(() => {
        const usuario = sessionStorage.getItem("username");
        if (usuario) {
          console.log("[useEffect] Login automatico realizado:", usuario);
          setUsername(usuario);
        } else {
          console.warn("[useEffect] Login automatico falhou.");
        }
      });
    } else {
      console.log("[useEffect] Usuario ja logado:", user);
      setUsername(user);
    }
  }, []);

  const isEan = (codigo) => /^\d{13,}$/.test(codigo); // 13+ digitos = EAN

  const handleSearch = async (incomingCode) => {
    // Sempre usa o campo correspondente ao modo atual
    const raw = typeof incomingCode === "string" && incomingCode.length > 0
      ? incomingCode
      : (isOn ? gp : ean);
    const codigo = (raw || "").trim();

    console.log("[handleSearch] Modo:", isOn ? "GRUPO" : "SKU/EAN", " | Codigo:", codigo);

    if (!codigo) {
      // limpa tudo
      if (isOn) setGp("");
      else setEan("");
      setSubmittedEan("");
      setPreco(null);
      setEstoque([]);
      setCombos([]);
      setMsgErro("");
      return;
    }

    // registra o termo pesquisado pro banner
    setSubmittedEan(codigo);
    setMsgErro("");

    // 1) Se for EAN: resolve para SKU e segue pelo fluxo padrao EAN
    if (isEan(codigo)) {
      try {
        const sku = await getSku(codigo);
        if (sku === null) {
          setMsgErro("Produto nao encontrado");
          setPreco(null);
          setEstoque([]);
          return;
        }

        const precoData = await getPrecoPorGrupo(sku);
        setPreco(precoData);
        try {
          const combosData = await getCombo(sku);
          setCombos(combosData);
        } catch (e) {
          console.error("[handleSearch][EAN] Erro combos:", e);
          setCombos([]);
        }

        if (!precoData?.referenceCode) {
          setEstoque([]);
          setCombos([]);
          return;
        }

        const estoqueData = await getEstoque(precoData.referenceCode);
        setEstoque(estoqueData);
      } catch (err) {
        console.error("[handleSearch][EAN] Erro:", err);
        setMsgErro("Erro ao buscar produto por EAN.");
        setPreco(null);
        setEstoque([]);
        setCombos([]);
      }

      setEan('');
      setGp('');
      return;
    }

    // 2) Nao e EAN: decide fluxo pelo isOn
    if (!isOn) {
      // Fluxo padrao: preco -> estoque (usa `codigo` como SKU/codigo)
      try {
        const precoData = await getPrecoPorGrupo(codigo);
        setPreco(precoData);
        try {
          const combosData = await getCombo(codigo);
          setCombos(combosData);
        } catch (e) {
          console.error("[handleSearch][PADRAO] Erro combos:", e);
          setCombos([]);
        }

        if (!precoData?.referenceCode) {
          setEstoque([]);
          setCombos([]);
          return;
        }

        const estoqueData = await getEstoque(precoData.referenceCode);
        setEstoque(estoqueData);
      } catch (error) {
        console.error("[handleSearch][PADRAO] Erro:", error);
        setMsgErro("Erro ao buscar produto.");
        setPreco(null);
        setEstoque([]);
        setCombos([]);
      }
    } else {
      // Fluxo grupo: estoque -> preco (usa `codigo` como grupo/sku conforme seu backend)
      try {
        const estoqueData = await getEstoque(codigo);
        setEstoque(estoqueData);

        const productCode =
          Array.isArray(estoqueData) && estoqueData.length > 0
            ? estoqueData[0].productCode
            : null;

        if (!productCode) {
          setMsgErro("Estoque nao encontrado");
          setEan('');
          setGp('');
          setPreco(null);
          setCombos([]);
          return;
        }

        const precoData = await getPrecoPorGrupo(productCode);
        setPreco(precoData);
        try {
          const combosData = await getCombo(productCode);
          setCombos(combosData);
        } catch (e) {
          console.error("[handleSearch][GRUPO] Erro combos:", e);
          setCombos([]);
        }
      } catch (error) {
        console.error("[handleSearch][GRUPO] Erro:", error);
        setMsgErro("Erro ao buscar item pelo grupo.");
        setEan('');
        setGp('');
        setPreco(null);
        setEstoque([]);
        setCombos([]);
      }
    }

    setGp('');
    setEan('');
  };

  const handleSearchCNPJ = async (valor) => {
    console.log("[handleSearchCNPJ] Valor recebido:", valor);

    if (!valor || valor.trim() === "") {
      setCnpj("");
      setSubmittedCnpj("");
      setDesc("");
      console.log("[handleSearchCNPJ] Valor vazio, limpando states");
      return;
    }

    setCnpj(valor);
    setSubmittedCnpj(valor);
    console.log("[handleSearchCNPJ] State CNPJ setado:", valor);

    try {
      const descricao = await getDesc(valor);
      console.log("[handleSearchCNPJ] getDesc retorno:", descricao);
      setDesc(descricao);
    } catch (error) {
      console.error(
        "[handleSearchCNPJ] Erro ao buscar descricao do CNPJ:",
        error
      );
      setDesc("");
    }
  };

  const handleLogout = () => {
    console.log("[handleLogout] Realizando logout e limpando sessionStorage");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("access_token");
    navigate("/Login");
  };

  const validaDesc = (desc) => {
    if (desc === "1") {
      console.log("[validaDesc] Corrigindo desconto de 1% para 10%");
      return (desc = "10");
    }
    return desc;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fb' }}>
      <Header username={username} onLogout={handleLogout} />

      <Box
        sx={{
          maxWidth: 480,
          mx: 'auto',
          px: 2,
          pt: 3,
          pb: 4,
        }}
      >
        {/* Search section */}
        <Box sx={{ mb: 3 }}>
          <BuscaDesc value={cnpj} onChange={setCnpj} onSubmit={handleSearchCNPJ} />

          {cnpj !== "" && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {desc === "" ? (
                <Chip
                  label="Sem desconto"
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#e2e8f0',
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              ) : (
                <Chip
                  label={`Desconto: ${validaDesc(desc)}%`}
                  size="small"
                  sx={{
                    bgcolor: '#fef2f2',
                    color: '#CB3B31',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: '1px solid #fecaca',
                  }}
                />
              )}
            </Box>
          )}

          <CampoDeBuscaGrupo value={gp} onChange={setGp} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)} />

          <CampoDeBusca value={ean} onChange={setEan} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)} />
        </Box>

        {/* Search result indicator */}
        {submittedEan && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              label={`Busca: ${submittedEan}`}
              size="small"
              onDelete={() => {
                setSubmittedEan("");
                setPreco(null);
                setEstoque([]);
                setCombos([]);
              }}
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 500,
                fontSize: '0.75rem',
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  fontSize: '1rem',
                  '&:hover': { color: '#CB3B31' },
                },
              }}
            />
          </Box>
        )}

        {/* Error message */}
        {msgErro !== "" && (
          <Box
            className="fade-in"
            sx={{
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 3,
              px: 2.5,
              py: 1.5,
              mb: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
              {msgErro}
            </Typography>
          </Box>
        )}

        {/* Product results */}
        <TabelaEstoque
          data={estoque}
          preco={preco?.price}
          desconto={validaDesc(desc)}
          combos={combos}
        />
      </Box>
    </Box>
  );
}
