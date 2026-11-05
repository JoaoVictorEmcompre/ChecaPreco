import {useMemo, useState, useRef, useEffect} from 'react';
import {styled} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#CB3B31',
        color: theme.palette.common.white,
        border: '1px solid #b0302a',
        fontWeight: 600,
        textAlign: 'center',
    },
    [`&.${tableCellClasses.body}`]: {
        border: '1px solid #d9d9d9',
        padding: '10px 12px',
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#fcfcfc',
    },
    '&:hover': {
        backgroundColor: '#f5f5f5',
    },
}));

// Tooltip com o código do produto: só aparece em dispositivos com mouse (desktop)
function TooltipCodigo({codigo, children}) {
    const temHover = useMediaQuery('(hover: hover) and (pointer: fine)');
    if (!temHover || !codigo) return children;
    return (
        <Tooltip title={`Código: ${codigo}`} placement="top" followCursor arrow>
            {children}
        </Tooltip>
    );
}

// Destaque da linha/célula do item buscado (busca por EAN ou por item, nunca por grupo)
const ehItemBuscado = (codigos, alvo) =>
    alvo != null && alvo !== '' && [].concat(codigos).some(c => String(c) === String(alvo));

const estiloDestaque = (ativo) => ativo ? {
    backgroundColor: '#e8f2fd',
    fontWeight: 600,
} : {};

function agruparPorReferencia(items) {
    const grupos = {};
    items.forEach(item => {
        const ref = item.referenceCode;
        if (!grupos[ref]) grupos[ref] = [];
        grupos[ref].push(item);
    });
    return grupos;
}

function identificarTipoGrupo(grupo) {
    const cores = new Set(grupo.map(i => i.colorName));
    const tamanhos = new Set(grupo.map(i => i.sizeName));
    if (cores.size === 1 && tamanhos.size > 1) return "VAR_TAMANHO";
    if (tamanhos.size === 1 && cores.size > 1) return "VAR_COR";
    if (tamanhos.size > 1 && cores.size > 1) return "VAR_AMBOS";
    return "FIXO";
}

function formatarNomeProduto(productName, grupo, tipoVariacao) {
    if (!productName || !grupo?.length) return '';

    let nome = productName.toUpperCase();

    const tamanhos = [...new Set(grupo.map(i => i.sizeName?.toUpperCase().trim()).filter(Boolean))];
    const cores = [...new Set(grupo.map(i => i.colorName?.toUpperCase().trim()).filter(Boolean))];

    // Decide o que remover
    const removerTamanhos = tipoVariacao === 'VAR_TAMANHO' || tipoVariacao === 'VAR_AMBOS';
    const removerCores = tipoVariacao === 'VAR_COR' || tipoVariacao === 'VAR_AMBOS';

    if (removerTamanhos) {
        tamanhos.forEach(tam => {
            tam.split(/[-\s/]+/).forEach(p => {
                nome = nome.replace(new RegExp(`\\b${p}\\b`, 'g'), '');
            });
        });
    }

    if (removerCores) {
        cores.forEach(cor => {
            cor.split(/[-\s/]+/).forEach(p => {
                nome = nome.replace(new RegExp(`\\b${p}\\b`, 'g'), '');
            });
        });
    }

    nome = nome
        .replace(/[-_.]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    nome = nome
        .split(' ')
        .filter((val, idx, arr) => val !== arr[idx - 1])
        .join(' ');

    nome = nome
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());

    return nome;
}

function normalizarNumero(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function calcularPrecoFinal({preco, desconto, promocao}) {
    const precoNormal = normalizarNumero(preco);
    const percentualDesconto = normalizarNumero(desconto);

    const vlPromocao = normalizarNumero(promocao?.vlPromocao);
    const vlAnterior = normalizarNumero(promocao?.vlAnterior);

    const temPromocao =
        promocao &&
        vlPromocao > 0 &&
        vlAnterior > 0 &&
        vlPromocao < vlAnterior;

    const temDescontoCnpj = percentualDesconto > 0;

    if (!precoNormal && !temPromocao) {
        return {
            labelsDe: [],
            precoPor: 0,
            temPromocao: false,
            temDescontoCnpj,
        };
    }

    if (temPromocao && temDescontoCnpj) {
        const precoFinal = vlPromocao * (1 - percentualDesconto / 100);

        return {
            labelsDe: [
                {label: 'De', valor: vlAnterior},
                {label: 'Promoção', valor: vlPromocao},
            ],
            precoPor: Number(precoFinal.toFixed(2)),
            temPromocao: true,
            temDescontoCnpj: true,
        };
    }

    if (temPromocao) {
        return {
            labelsDe: [
                {label: 'De', valor: vlAnterior},
            ],
            precoPor: vlPromocao,
            temPromocao: true,
            temDescontoCnpj: false,
        };
    }

    if (temDescontoCnpj) {
        const precoFinal = precoNormal * (1 - percentualDesconto / 100);

        return {
            labelsDe: [
                {label: 'De', valor: precoNormal},
            ],
            precoPor: Number(precoFinal.toFixed(2)),
            temPromocao: false,
            temDescontoCnpj: true,
        };
    }

    return {
        labelsDe: [],
        precoPor: precoNormal,
        temPromocao: false,
        temDescontoCnpj: false,
    };
}

function precoComPercentual(valor, percentual) {
    if (typeof valor !== 'number' || typeof percentual !== 'number') return '';
    const fator = 1 - (percentual / 100);
    return valor * fator;
}

function TabelaMatriz({grupo, itemBuscado}) {
    const cores = [...new Set(grupo.map(i => i.colorName))];
    const tamanhos = [...new Set(grupo.map(i => i.sizeName))].sort((a, b) => parseInt(a) - parseInt(b));
    const estoqueMap = {};
    const codigoMap = {};
    grupo.forEach(i => {
        const key = `${i.colorName}_${i.sizeName}`;
        const qtd = i.balances?.[0]?.stock ?? 0;
        estoqueMap[key] = (estoqueMap[key] || 0) + qtd;
        codigoMap[key] = [...(codigoMap[key] || []), i.productCode];
    });

    return (
        <Box sx={{position: 'relative'}}>
            <Typography variant="caption" sx={{mb: 0.5, display: 'block', color: 'gray'}}>Arraste para o lado
                ↔</Typography>
            <TableContainer component={Paper} sx={{mb: 4, overflowX: 'auto'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align='center' sx={{position: 'sticky', left: 0, zIndex: 2}}>Cor / Tamanho</StyledTableCell>
                            {tamanhos.map(t => <StyledTableCell key={t} align="right">{t}</StyledTableCell>)}</TableRow>
                    </TableHead>
                    <TableBody>
                        {cores.map(cor => (
                            <StyledTableRow key={cor}>
                                <StyledTableCell sx={{position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#fff', fontWeight: 500}}>{cor}</StyledTableCell>
                                {tamanhos.map(t => {
                                    const estoque = estoqueMap[`${cor}_${t}`];
                                    const destaque = ehItemBuscado(codigoMap[`${cor}_${t}`] || [], itemBuscado);
                                    return (
                                        <TooltipCodigo key={t} codigo={codigoMap[`${cor}_${t}`]?.join(', ')}>
                                            <StyledTableCell align="center" sx={{
                                                color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                                backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                                fontWeight: estoque <= 0 ? 600 : 400,
                                                ...estiloDestaque(destaque),
                                            }}>
                                                {estoque ?? "-"}
                                            </StyledTableCell>
                                        </TooltipCodigo>
                                    );
                                })}
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function TabelaPorTamanho({grupo, itemBuscado}) {
    return (
        <TableContainer component={Paper} sx={{mb: 4}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Tamanho</StyledTableCell>
                        <StyledTableCell align="center">Estoque</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {grupo.map((item) => {
                        const estoque = item.balances?.[0]?.stock ?? 0;
                        const destaque = ehItemBuscado(item.productCode, itemBuscado);
                        return (
                            <TooltipCodigo key={`${item.referenceCode}-${item.colorName}-${item.sizeName}`}
                                           codigo={item.productCode}>
                                <StyledTableRow>
                                    <StyledTableCell sx={estiloDestaque(destaque)}>{item.sizeName}</StyledTableCell>
                                    <StyledTableCell align="center" sx={{
                                        color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                        backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                        fontWeight: estoque <= 0 ? 600 : 400,
                                        ...estiloDestaque(destaque),
                                    }}>
                                        {estoque}
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TooltipCodigo>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function TabelaPorCor({grupo, itemBuscado}) {
    return (
        <TableContainer component={Paper} sx={{mb: 4}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell align='center'>Cor</StyledTableCell>
                        <StyledTableCell align="center">Estoque</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {grupo.map((item) => {
                        const estoque = item.balances?.[0]?.stock ?? 0;
                        const destaque = ehItemBuscado(item.productCode, itemBuscado);
                        return (
                            <TooltipCodigo key={`${item.referenceCode}-${item.colorName}-${item.sizeName}`}
                                           codigo={item.productCode}>
                                <StyledTableRow>
                                    <StyledTableCell sx={estiloDestaque(destaque)}>{item.colorName}</StyledTableCell>
                                    <StyledTableCell align="center" sx={{
                                        color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                        backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                        fontWeight: estoque <= 0 ? 600 : 400,
                                        ...estiloDestaque(destaque),
                                    }}>
                                        {estoque}
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TooltipCodigo>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const formataPreco = (preco) => {
    if (typeof preco !== 'number') return '';
    return preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
};

function calcularEstoqueTotal(grupo) {
    return grupo.reduce((acc, item) => {
        const estoque = item.balances?.[0]?.stock ?? 0;
        return estoque > 0 ? acc + estoque : acc;
    }, 0);
}

function formatarData(iso) {
    if (!iso) return '-';
    const data = new Date(iso);
    return isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR');
}

function PedidosCompraDialog({open, onClose, pedidos, tipo, itemBuscado}) {
    const mostrarCor = tipo === 'VAR_COR' || tipo === 'VAR_AMBOS';
    const mostrarTamanho = tipo === 'VAR_TAMANHO' || tipo === 'VAR_AMBOS';

    const pedidosOrdenados = useMemo(
        () => [...pedidos].sort((a, b) => String(a.deliveryForecastDate || '9999').localeCompare(String(b.deliveryForecastDate || '9999'))),
        [pedidos]
    );
    const totalUnidades = pedidos.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);

    const containerRef = useRef(null);
    const [temMaisAbaixo, setTemMaisAbaixo] = useState(false);

    const verificarScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const folga = 4;
        setTemMaisAbaixo(el.scrollHeight - el.scrollTop - el.clientHeight > folga);
    };

    useEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(verificarScroll);
        return () => cancelAnimationFrame(id);
    }, [open, pedidos]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                backdrop: {sx: {backgroundColor: 'rgba(0, 0, 0, 0.6)'}},
                paper: {sx: {m: 1, width: 'calc(100% - 16px)', borderRadius: 3}},
            }}
        >
            <DialogContent sx={{position: 'relative', p: {xs: 2, sm: 3}, overflowY: 'visible'}}>
                <IconButton
                    onClick={onClose}
                    aria-label="Fechar"
                    sx={{position: 'absolute', top: 8, right: 8, color: '#666'}}
                >
                    <CloseIcon/>
                </IconButton>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pr: 5}}>
                    <Box sx={{
                        width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
                        backgroundColor: '#e8f5e9', color: '#2e7d32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <LocalShippingIcon/>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{fontWeight: 600, color: '#222', lineHeight: 1.2}}>
                            Pedidos de compra
                        </Typography>
                        <Typography variant="body2" sx={{color: '#666'}}>
                            {pedidos.length} {pedidos.length === 1 ? 'item' : 'itens'} · {totalUnidades} un. a caminho
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{position: 'relative'}}>
                    <TableContainer
                        ref={containerRef}
                        onScroll={verificarScroll}
                        sx={{maxHeight: {xs: '65vh', sm: '60vh'}, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 2}}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {mostrarCor && <StyledTableCell>Cor</StyledTableCell>}
                                    {mostrarTamanho && <StyledTableCell>Tamanho</StyledTableCell>}
                                    <StyledTableCell align="center">Qtd.</StyledTableCell>
                                    <StyledTableCell align="center">Previsão</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pedidosOrdenados.map((p) => {
                                    const destaque = estiloDestaque(ehItemBuscado(p.productCode, itemBuscado));
                                    return (
                                        <StyledTableRow key={`${p.orderCode}-${p.productCode}-${p.colorName}-${p.sizeName}`}>
                                            {mostrarCor && <StyledTableCell sx={destaque}>{p.colorName}</StyledTableCell>}
                                            {mostrarTamanho && <StyledTableCell sx={destaque}>{p.sizeName}</StyledTableCell>}
                                            <StyledTableCell align="center" sx={{fontWeight: 600, ...destaque}}>{p.quantity}</StyledTableCell>
                                            <StyledTableCell align="center" sx={destaque}>{formatarData(p.deliveryForecastDate)}</StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {temMaisAbaixo && (
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: 40,
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                pb: 0.5,
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95) 65%)',
                            }}
                        >
                            <KeyboardArrowDownIcon sx={{color: '#CB3B31'}}/>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default function TabelaEstoque({data, preco, desconto = 0, combos = [], promocao = null, pedidosCompra = [], cod, itemBuscado = null}) {
    const [pedidoAberto, setPedidoAberto] = useState(null);

    const grupos = useMemo(() => {
        const agrupado = agruparPorReferencia(data);
        return Object.entries(agrupado).map(([ref, grupo]) => {
            const tipo = identificarTipoGrupo(grupo);
            const nomeBase = formatarNomeProduto(grupo[0].productName, grupo, tipo);
            const skusGrupo = new Set(grupo.map(i => String(i.productCode)));
            const pedidosGrupo = pedidosCompra.filter(p => skusGrupo.has(String(p.productCode)));
            return {ref, grupo, tipo, nomeBase, pedidosGrupo};
        });
    }, [data, pedidosCompra]);

    const precoFinal = useMemo(
        () => calcularPrecoFinal({preco, desconto, promocao}),
        [preco, desconto, promocao]
    );

    return (
        <>
            {grupos.map(({ref, grupo, tipo, nomeBase, pedidosGrupo}) => (
                <div key={ref}>

                    {pedidosGrupo.length > 0 && (
                        <>
                            <Chip
                                icon={<LocalShippingIcon sx={{color: 'white !important'}}/>}
                                label="Pedido de compra"
                                onClick={() => setPedidoAberto(ref)}
                                sx={{
                                    mb: 1.5,
                                    height: 36,
                                    px: 0.5,
                                    backgroundColor: '#2e7d32',
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
                                    '&:hover': {backgroundColor: '#256b29', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'},
                                }}
                                title="Pedido de compra em andamento para este produto"
                            />
                            <PedidosCompraDialog
                                open={pedidoAberto === ref}
                                onClose={() => setPedidoAberto(null)}
                                pedidos={pedidosGrupo}
                                tipo={tipo}
                                itemBuscado={itemBuscado}
                            />
                        </>
                    )}

                    <Typography variant="body2" sx={{mb: 0.5, color: '#777', fontSize: '14px'}}>
                        Código: {cod}
                    </Typography>

                    <Typography component="h2" variant="h1"
                                sx={{mb: 1.5, color: '#222', fontSize: {xs: '22px', sm: '28px'}, fontWeight: 600, lineHeight: 1.25}}>
                        {nomeBase}
                    </Typography>

                    {desconto > 0 && (
                        <Chip
                            label={`Desconto CNPJ: ${desconto}%`}
                            size="small"
                            sx={{mb: 1.5, backgroundColor: '#e8f5e9', color: '#1b5e20', fontWeight: 600}}
                        />
                    )}

                    {precoFinal.labelsDe.map((item) => (
                        <Typography
                            key={item.label}
                            variant="body2"
                            sx={{color: '#888', textDecoration: 'line-through', fontSize: '17px', fontWeight: 400}}
                        >
                            {item.label}: {formataPreco(item.valor)}
                        </Typography>
                    ))}

                    <Typography component="p" sx={{mb: 2, color: '#333', fontSize: '18px'}}>
                        {precoFinal.temDescontoCnpj ? 'Para você:' : 'Preço:'}{' '}
                        <Box component="span" sx={{
                            fontSize: {xs: '32px', sm: '38px'},
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: precoFinal.temPromocao || precoFinal.temDescontoCnpj ? '#CB3B31' : '#222',
                        }}>
                            {formataPreco(precoFinal.precoPor)}
                        </Box>
                    </Typography>

                    {Array.isArray(combos) && combos.length > 0 && (
                        <Box sx={{mb: 2, p: 1.5, borderRadius: 2, backgroundColor: '#fdf3f2'}}>
                            {combos.map((c) => {
                                const valor = formataPreco(
                                    precoComPercentual(precoFinal.precoPor, c.percentual)
                                );

                                return (
                                    <Box
                                        key={c.quantidade}
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            justifyContent: "space-between",
                                            alignItems: "baseline",
                                            columnGap: 2,
                                            py: 0.5,
                                        }}
                                    >
                                        <Typography sx={{fontSize: '16px', color: '#333'}}>
                                            Leve {c.quantidade} unidades ou mais e pague:
                                        </Typography>

                                        <Typography sx={{fontSize: '24px', fontWeight: 600, whiteSpace: "nowrap", color: '#CB3B31'}}>
                                            {valor}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    <Typography variant="h2" sx={{mb: 1.5, color: '#333', fontSize: '20px', fontWeight: 400}}>
                        Quantidade em estoque: <strong>{calcularEstoqueTotal(grupo)}</strong>
                    </Typography>

                    {tipo === "VAR_TAMANHO" && <TabelaPorTamanho grupo={grupo} itemBuscado={itemBuscado}/>}
                    {tipo === "VAR_COR" && <TabelaPorCor grupo={grupo} itemBuscado={itemBuscado}/>}
                    {tipo === "VAR_AMBOS" && <TabelaMatriz grupo={grupo} itemBuscado={itemBuscado}/>}
                    {tipo === "FIXO" && (
                        <Typography variant="h3" sx={{mb: 1, color: '#333', fontSize: '18px', fontWeight: 400}}>
                            Sem variação.
                        </Typography>
                    )}
                </div>
            ))}
        </>
    );
}
