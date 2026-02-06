import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
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
      console.log("[useEffect] Sem usuário logado, executando loginAutomatico");
      loginAutomatico().then(() => {
        const usuario = sessionStorage.getItem("username");
        if (usuario) {
          console.log("[useEffect] Login automático realizado:", usuario);
          setUsername(usuario);
        } else {
          console.warn("[useEffect] Login automático falhou.");
        }
      });
    } else {
      console.log("[useEffect] Usuário já logado:", user);
      setUsername(user);
    }
  }, []);

  const isEan = (codigo) => /^\d{13,}$/.test(codigo); // 13+ dígitos = EAN

  const handleSearch = async (incomingCode) => {
    // Sempre usa o campo correspondente ao modo atual
    const raw = typeof incomingCode === "string" && incomingCode.length > 0
      ? incomingCode
      : (isOn ? gp : ean);
    const codigo = (raw || "").trim();

    console.log("[handleSearch] Modo:", isOn ? "GRUPO" : "SKU/EAN", " | Código:", codigo);

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

    // 1) Se for EAN: resolve para SKU e segue pelo fluxo padrão EAN
    if (isEan(codigo)) {
      try {
        const sku = await getSku(codigo);
        if (sku === null) {
          setMsgErro("Produto não encontrado");
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

    // 2) Não é EAN: decide fluxo pelo isOn
    if (!isOn) {
      // Fluxo padrão: preço -> estoque (usa `codigo` como SKU/código)
      try {
        const precoData = await getPrecoPorGrupo(codigo);
        setPreco(precoData);
        try {
          const combosData = await getCombo(codigo);
          setCombos(combosData);
        } catch (e) {
          console.error("[handleSearch][PADRÃO] Erro combos:", e);
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
        console.error("[handleSearch][PADRÃO] Erro:", error);
        setMsgErro("Erro ao buscar produto.");
        setPreco(null);
        setEstoque([]);
        setCombos([]);
      }
    } else {
      // Fluxo grupo: estoque -> preço (usa `codigo` como grupo/sku conforme seu backend)
      try {
        const estoqueData = await getEstoque(codigo);
        setEstoque(estoqueData);

        const productCode =
          Array.isArray(estoqueData) && estoqueData.length > 0
            ? estoqueData[0].productCode
            : null;

        if (!productCode) {
          setMsgErro("Estoque não encontrado");
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
        "[handleSearchCNPJ] Erro ao buscar descrição do CNPJ:",
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
    <div>
      <Header username={username} onLogout={handleLogout} />

      <div style={{ padding: 24 }}>
        <BuscaDesc value={cnpj} onChange={setCnpj} onSubmit={handleSearchCNPJ} />

        {cnpj !== "" &&
          (desc === "" ? (
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: "center" }}>
              <strong>Usuário sem desconto</strong>
            </Typography>
          ) : (
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: "center" }}>
              Desconto: <strong>{validaDesc(desc)}%</strong>
            </Typography>
          ))}

        <CampoDeBuscaGrupo value={gp} onChange={setGp} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)} />

        <CampoDeBusca value={ean} onChange={setEan} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)} />

        {submittedEan && (
          <Typography variant="subtitle2" sx={{ mb: 2, textAlign: "center" }}>
            Resultado da busca por: <strong>{submittedEan}</strong>
          </Typography>
        )}

        {msgErro !== "" && (
          <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
            <strong>{msgErro}</strong>
          </Typography>
        )}

        <TabelaEstoque
          data={estoque}
          preco={preco?.price}
          desconto={validaDesc(desc)}
          combos={combos}
        />
      </div>
    </div>
  );
}
