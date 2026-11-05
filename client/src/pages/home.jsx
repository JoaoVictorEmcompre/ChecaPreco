import {useState} from "react";
import {Alert, Box, LinearProgress, ToggleButton, ToggleButtonGroup} from "@mui/material";
import CampoDeBusca from "../components/busca";
import CampoDeBuscaGrupo from "../components/buscaGrupo";
import TabelaEstoque from "../components/tabela";
import Header from "../components/header";
import {getPrecoPorGrupo} from "../service/price.services";
import {getEstoque} from "../service/stock.services";
import {getSku} from "../service/ean";
import BuscaDesc from "../components/buscaDesc";
import {getDesc} from "../service/cnpj.services";
import {getCombo} from "../service/combo.services";
import {getPromocao} from "../service/promocao.services.js";
import {getPedidosCompra} from "../service/pedidosCompra.services.js";

const resolverCombos = (result, contexto) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`[handleSearch][${contexto}] Erro combos:`, result.reason);
    return [];
};

// A promoção é consultada pelo código do grupo (referenceCode). Falha não impede a busca principal.
const buscarPromocao = async (grupo, contexto) => {
    if (!grupo) return null;
    try {
        return (await getPromocao(grupo)) || null;
    } catch (e) {
        console.error(`[handleSearch][${contexto}] Erro promoção:`, e);
        return null;
    }
};

const seletorModo = {
    display: "flex",
    maxWidth: 360,
    mx: "auto",
    mb: 1.5,
    p: "4px",
    gap: "4px",
    borderRadius: 999,
    backgroundColor: "#e9edf2",
    "& .MuiToggleButtonGroup-grouped": {
        border: 0,
        m: 0,
        borderRadius: "999px !important",
        py: 0.75,
        fontSize: 14,
        fontWeight: 600,
        textTransform: "none",
        color: "#667085",
        transition: "background-color 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out",
        "&:hover": {backgroundColor: "rgba(255,255,255,0.6)"},
        "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: "#fff",
            color: "#CB3B31",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        },
    },
};

const skusDoGrupo = (estoqueData) =>
    [...new Set((estoqueData || []).map(i => i.productCode).filter(Boolean))];

export default function HomePage() {
    const [username] = useState(() => sessionStorage.getItem("username") || "");
    const [ean, setEan] = useState("");
    const [gp, setGp] = useState("");
    const [submittedEan, setSubmittedEan] = useState("");
    const [estoque, setEstoque] = useState([]);
    const [preco, setPreco] = useState([]);
    const [combos, setCombos] = useState([]);
    const [cnpj, setCnpj] = useState("");
    const [desc, setDesc] = useState("");
    const [msgErro, setMsgErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [modo, setModo] = useState("item");
    const isOn = modo === "grupo";
    const [promocao, setPromocao] = useState(null);
    const [pedidosCompra, setPedidosCompra] = useState([]);
    const [itemBuscado, setItemBuscado] = useState(null);

    const isEan = (codigo) => /^\d{13,}$/.test(codigo);

    const buscarPedidosCompra = async (estoqueData, contexto) => {
        const skus = skusDoGrupo(estoqueData);
        if (skus.length === 0) {
            setPedidosCompra([]);
            return;
        }
        try {
            setPedidosCompra(await getPedidosCompra(skus));
        } catch (e) {
            console.error(`[handleSearch][${contexto}] Erro pedidos de compra:`, e);
            setPedidosCompra([]);
        }
    };

    const executarBusca = async (incomingCode) => {
        const raw = typeof incomingCode === "string" && incomingCode.length > 0
            ? incomingCode
            : (isOn ? gp : ean);
        const codigo = (raw || "").trim();

        if (!codigo) {
            if (isOn) setGp("");
            else setEan("");
            setSubmittedEan("");
            setItemBuscado(null);
            setPreco(null);
            setEstoque([]);
            setCombos([]);
            setPromocao(null);
            setPedidosCompra([]);
            setMsgErro("");
            return;
        }

        setSubmittedEan(codigo);
        setMsgErro("");
        // Só busca por item (EAN ou código do item) destaca a linha; busca por grupo não
        setItemBuscado(isEan(codigo) || isOn ? null : codigo);

        if (isEan(codigo)) {
            try {
                const sku = await getSku(codigo);
                setItemBuscado(sku);
                if (sku === null) {
                    setMsgErro("Produto não encontrado");
                    setPreco(null);
                    setEstoque([]);
                    setPromocao(null);
                    setPedidosCompra([]);
                    return;
                }

                const [precoResult, combosResult] = await Promise.allSettled([
                    getPrecoPorGrupo(sku),
                    getCombo(sku),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                const precoData = precoResult.value;
                setPreco(precoData);
                setCombos(resolverCombos(combosResult, "EAN"));

                if (!precoData?.referenceCode) {
                    setEstoque([]);
                    setCombos([]);
                    setPromocao(null);
                    setPedidosCompra([]);
                    return;
                }

                const [estoqueData, promocaoData] = await Promise.all([
                    getEstoque(precoData.referenceCode),
                    buscarPromocao(precoData.referenceCode, "EAN"),
                ]);
                setEstoque(estoqueData);
                setPromocao(promocaoData);
                await buscarPedidosCompra(estoqueData, "EAN");
            } catch (err) {
                console.error("[handleSearch][EAN] Erro:", err);
                setMsgErro("Erro ao buscar produto por EAN.");
                setPreco(null);
                setEstoque([]);
                setCombos([]);
                setPromocao(null);
                setPedidosCompra([]);
            }

            setEan('');
            setGp('');
            return;
        }

        if (!isOn) {
            try {
                const [precoResult, combosResult] = await Promise.allSettled([
                    getPrecoPorGrupo(codigo),
                    getCombo(codigo),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                const precoData = precoResult.value;
                setPreco(precoData);
                setCombos(resolverCombos(combosResult, "PADRÃO"));

                if (!precoData?.referenceCode) {
                    setEstoque([]);
                    setCombos([]);
                    setPromocao(null);
                    setPedidosCompra([]);
                    return;
                }

                const [estoqueData, promocaoData] = await Promise.all([
                    getEstoque(precoData.referenceCode),
                    buscarPromocao(precoData.referenceCode, "PADRÃO"),
                ]);
                setEstoque(estoqueData);
                setPromocao(promocaoData);
                await buscarPedidosCompra(estoqueData, "PADRÃO");
            } catch (error) {
                console.error("[handleSearch][PADRÃO] Erro:", error);
                setMsgErro("Erro ao buscar produto.");
                setPreco(null);
                setEstoque([]);
                setCombos([]);
                setPromocao(null);
                setPedidosCompra([]);
            }
        } else {
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
                    setPromocao(null);
                    setPedidosCompra([]);
                    return;
                }

                const [[precoResult, combosResult], promocaoData] = await Promise.all([
                    Promise.allSettled([getPrecoPorGrupo(productCode), getCombo(productCode)]),
                    buscarPromocao(codigo, "GRUPO"),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                setPreco(precoResult.value);
                setCombos(resolverCombos(combosResult, "GRUPO"));
                setPromocao(promocaoData);
                await buscarPedidosCompra(estoqueData, "GRUPO");
            } catch (error) {
                console.error("[handleSearch][GRUPO] Erro:", error);
                setMsgErro("Erro ao buscar item pelo grupo.");
                setEan('');
                setGp('');
                setPreco(null);
                setEstoque([]);
                setCombos([]);
                setPedidosCompra([]);
            }
        }

        setGp('');
        setEan('');
    };

    // Bloqueia novas ações enquanto uma busca está em andamento
    const handleSearch = async (incomingCode) => {
        if (carregando) return;
        setCarregando(true);
        try {
            await executarBusca(incomingCode);
        } finally {
            setCarregando(false);
        }
    };

    const executarBuscaCNPJ = async (valor) => {
        if (!valor || valor.trim() === "") {
            setCnpj("");
            setDesc("");
            return;
        }

        setCnpj(valor);

        try {
            const descricao = await getDesc(valor);
            setDesc(descricao);
        } catch (error) {
            console.error("[handleSearchCNPJ] Erro ao buscar descrição do CNPJ:", error);
            setDesc("");
        }
    };

    const handleSearchCNPJ = async (valor) => {
        if (carregando) return;
        setCarregando(true);
        try {
            await executarBuscaCNPJ(valor);
        } finally {
            setCarregando(false);
        }
    };

    const validaDesc = (desc) => {
        if (desc === "1") {
            return "10";
        }
        return desc;
    };

    return (
        <div>
            <Header username={username}/>
            {carregando && <LinearProgress sx={{height: 3}}/>}

            <Box sx={{p: {xs: 2, sm: 3}, maxWidth: 960, mx: "auto"}}>
                <BuscaDesc value={cnpj} onChange={setCnpj} onSubmit={handleSearchCNPJ} disabled={carregando}/>

                <ToggleButtonGroup
                    exclusive
                    disabled={carregando}
                    fullWidth
                    value={modo}
                    onChange={(_, novo) => {
                        if (novo) {
                            setModo(novo);
                            setMsgErro("");
                        }
                    }}
                    aria-label="Tipo de busca"
                    sx={seletorModo}
                >
                    <ToggleButton value="item">Item</ToggleButton>
                    <ToggleButton value="grupo">Grupo</ToggleButton>
                </ToggleButtonGroup>

                {isOn
                    ? <CampoDeBuscaGrupo value={gp} onChange={setGp} onSubmit={handleSearch} disabled={carregando} loading={carregando}/>
                    : <CampoDeBusca value={ean} onChange={setEan} onSubmit={handleSearch} disabled={carregando} loading={carregando}/>}

                {msgErro !== "" && (
                    <Alert severity="warning" sx={{mb: 2, mx: "auto", maxWidth: 360, fontWeight: 500}}>
                        {msgErro}
                    </Alert>
                )}

                <Box sx={{opacity: carregando ? 0.5 : 1, pointerEvents: carregando ? "none" : "auto", transition: "opacity 150ms ease-out"}}
                     aria-busy={carregando}>
                <TabelaEstoque
                    data={estoque}
                    preco={preco?.price}
                    desconto={validaDesc(desc)}
                    combos={combos}
                    promocao={promocao}
                    pedidosCompra={pedidosCompra}
                    cod={submittedEan}
                    itemBuscado={itemBuscado}
                />
                </Box>
            </Box>
        </div>
    );
}
