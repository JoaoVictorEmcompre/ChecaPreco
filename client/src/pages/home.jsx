import {useState} from "react";
import {Typography} from "@mui/material";
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

const resolverPromocao = (result, contexto) => {
    if (result.status === "fulfilled") return result.value || null;
    console.error(`[handleSearch][${contexto}] Erro promoção:`, result.reason);
    return null;
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
    const [isOn, setIsOn] = useState(false);
    const [promocao, setPromocao] = useState(null);
    const [pedidosCompra, setPedidosCompra] = useState([]);

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

    const handleSearch = async (incomingCode) => {
        const raw = typeof incomingCode === "string" && incomingCode.length > 0
            ? incomingCode
            : (isOn ? gp : ean);
        const codigo = (raw || "").trim();

        if (!codigo) {
            if (isOn) setGp("");
            else setEan("");
            setSubmittedEan("");
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

        if (isEan(codigo)) {
            try {
                const sku = await getSku(codigo);
                if (sku === null) {
                    setMsgErro("Produto não encontrado");
                    setPreco(null);
                    setEstoque([]);
                    setPromocao(null);
                    setPedidosCompra([]);
                    return;
                }

                const [precoResult, combosResult, promocaoResult] = await Promise.allSettled([
                    getPrecoPorGrupo(sku),
                    getCombo(sku),
                    getPromocao(sku),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                const precoData = precoResult.value;
                setPreco(precoData);
                setCombos(resolverCombos(combosResult, "EAN"));
                setPromocao(resolverPromocao(promocaoResult, "EAN"));

                if (!precoData?.referenceCode) {
                    setEstoque([]);
                    setCombos([]);
                    setPedidosCompra([]);
                    return;
                }

                const estoqueData = await getEstoque(precoData.referenceCode);
                setEstoque(estoqueData);
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
                const [precoResult, combosResult, promocaoResult] = await Promise.allSettled([
                    getPrecoPorGrupo(codigo),
                    getCombo(codigo),
                    getPromocao(codigo),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                const precoData = precoResult.value;
                setPreco(precoData);
                setCombos(resolverCombos(combosResult, "PADRÃO"));
                setPromocao(resolverPromocao(promocaoResult, "PADRÃO"));

                if (!precoData?.referenceCode) {
                    setEstoque([]);
                    setCombos([]);
                    setPedidosCompra([]);
                    return;
                }

                const estoqueData = await getEstoque(precoData.referenceCode);
                setEstoque(estoqueData);
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

                const [precoResult, combosResult, promocaoResult] = await Promise.allSettled([
                    getPrecoPorGrupo(productCode),
                    getCombo(productCode),
                    getPromocao(productCode),
                ]);

                if (precoResult.status === "rejected") throw precoResult.reason;
                setPreco(precoResult.value);
                setCombos(resolverCombos(combosResult, "GRUPO"));
                setPromocao(resolverPromocao(promocaoResult, "GRUPO"));
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

    const handleSearchCNPJ = async (valor) => {
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

    const validaDesc = (desc) => {
        if (desc === "1") {
            return "10";
        }
        return desc;
    };

    return (
        <div>
            <Header username={username}/>

            <div style={{padding: 24}}>
                <BuscaDesc value={cnpj} onChange={setCnpj} onSubmit={handleSearchCNPJ}/>

                <CampoDeBuscaGrupo value={gp} onChange={setGp} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)}/>

                <CampoDeBusca value={ean} onChange={setEan} onSubmit={handleSearch} onActivate={(v) => setIsOn(v)}/>

                {msgErro !== "" && (
                    <Typography variant="subtitle1" sx={{mb: 2, textAlign: "center"}}>
                        <strong>{msgErro}</strong>
                    </Typography>
                )}

                <TabelaEstoque
                    data={estoque}
                    preco={preco?.price}
                    desconto={validaDesc(desc)}
                    combos={combos}
                    promocao={promocao}
                    pedidosCompra={pedidosCompra}
                    cod={submittedEan}
                />
            </div>
        </div>
    );
}
