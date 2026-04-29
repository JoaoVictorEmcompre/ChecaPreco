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

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#CB3B31',
        color: theme.palette.common.white,
        border: '1px solid black',
        fontWeight: 600,
        textAlign: 'center',
    },
    [`&.${tableCellClasses.body}`]: {
        border: '1px solid black',
        padding: '8px 12px',
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

function TabelaMatriz({grupo}) {
    const cores = [...new Set(grupo.map(i => i.colorName))];
    const tamanhos = [...new Set(grupo.map(i => i.sizeName))].sort((a, b) => parseInt(a) - parseInt(b));
    const estoqueMap = {};
    grupo.forEach(i => {
        const key = `${i.colorName}_${i.sizeName}`;
        const qtd = i.balances?.[0]?.stock ?? 0;
        estoqueMap[key] = (estoqueMap[key] || 0) + qtd;
    });

    console.log('[TabelaEstoque] Renderizando TabelaMatriz | cores:', cores, '| tamanhos:', tamanhos, '| estoqueMap:', estoqueMap);

    return (
        <Box sx={{position: 'relative'}}>
            <Typography variant="caption" sx={{mb: 0.5, display: 'block', color: 'gray'}}>Arraste para o lado
                ↔</Typography>
            <TableContainer component={Paper} sx={{mb: 4, overflowX: 'auto'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align='center'>Cor / Tamanho</StyledTableCell>
                            {tamanhos.map(t => <StyledTableCell key={t} align="right">{t}</StyledTableCell>)}</TableRow>
                    </TableHead>
                    <TableBody>
                        {cores.map(cor => (
                            <StyledTableRow key={cor}>
                                <StyledTableCell>{cor}</StyledTableCell>
                                {tamanhos.map(t => {
                                    const estoque = estoqueMap[`${cor}_${t}`];
                                    return (
                                        <StyledTableCell key={t} align="center" sx={{
                                            color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                            backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                            fontWeight: estoque <= 0 ? 600 : 400,
                                        }}>
                                            {estoque ?? "-"}
                                        </StyledTableCell>
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

function TabelaPorTamanho({grupo}) {
    console.log('[TabelaEstoque] Renderizando TabelaPorTamanho | grupo:', grupo);
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
                    {grupo.map((item, idx) => {
                        const estoque = item.balances?.[0]?.stock ?? 0;
                        return (
                            <StyledTableRow key={idx}>
                                <StyledTableCell>{item.sizeName}</StyledTableCell>
                                <StyledTableCell align="center" sx={{
                                    color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                    backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                    fontWeight: estoque <= 0 ? 600 : 400,
                                }}>
                                    {estoque}
                                </StyledTableCell>
                            </StyledTableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function TabelaPorCor({grupo}) {
    console.log('[TabelaEstoque] Renderizando TabelaPorCor | grupo:', grupo);
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
                    {grupo.map((item, idx) => {
                        const estoque = item.balances?.[0]?.stock ?? 0;
                        return (
                            <StyledTableRow key={idx}>
                                <StyledTableCell>{item.colorName}</StyledTableCell>
                                <StyledTableCell align="center" sx={{
                                    color: estoque <= 0 ? '#CB3B31' : 'inherit',
                                    backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                                    fontWeight: estoque <= 0 ? 600 : 400,
                                }}>
                                    {estoque}
                                </StyledTableCell>
                            </StyledTableRow>
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

export default function TabelaEstoque({data, preco, desconto = 0, combos = [], promocao = null, cod}) {
    console.log('[TabelaEstoque] Render | props:', {data, preco, desconto, combos, promocao, cod});
    const agrupado = agruparPorReferencia(data);

    const normalizarNumero = (valor) => {
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : 0;
    };

    const calcularPrecoFinal = ({preco, desconto, promocao}) => {
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
    };

    const precoComPercentual = (valor, percentual) => {
        if (typeof valor !== 'number' || typeof percentual !== 'number') return '';
        const fator = 1 - (percentual / 100);
        return valor * fator;
    };

    return (
        <>
            {Object.entries(agrupado).map(([ref, grupo]) => {
                const tipo = identificarTipoGrupo(grupo);
                const nomeBase = formatarNomeProduto(grupo[0].productName, grupo, tipo);
                const precoFinal = calcularPrecoFinal({ preco, desconto, promocao });

                console.log('[TabelaEstoque] Grupo ref:', ref, '| tipo:', tipo, '| nomeBase:', nomeBase, '| grupo:', grupo);

                return (
                    <div key={ref}>

                        {desconto > 0 && (
                            <Typography variant="h1"
                                        sx={{mb: 1, mp: 2, fontSize: '18px', fontWeight: 300, color: '#333'}}>
                                Desconto CNPJ: {desconto}%
                            </Typography>
                        )}

                        <Typography variant="h1" sx={{mb: 1, mp: 2, fontSize: '18px', fontWeight: 300, color: '#333'}}>
                            Código: {cod}
                        </Typography>

                        <Typography variant="h1" sx={{mb: 1, color: '#333', fontSize: '28px', fontWeight: 400}}>
                            {nomeBase}
                        </Typography>

                        {precoFinal.labelsDe.map((item, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                sx={{
                                    color: '#888',
                                    textDecoration: 'line-through',
                                    mb: index === precoFinal.labelsDe.length - 1 ? -1 : 0,
                                    fontSize: '19px',
                                    fontWeight: 400,
                                }}
                            >
                                {item.label}: {formataPreco(item.valor)}
                            </Typography>
                        ))}

                        <Typography variant="h1" sx={{ mb: 2, color: '#333', fontSize: '30px', fontWeight: 400 }}>
                            {precoFinal.temDescontoCnpj ? 'Para você:' : 'Preço:'} {formataPreco(precoFinal.precoPor)}
                        </Typography>

                        {Array.isArray(combos) && combos.length > 0 && (
                            <Box sx={{mb: 2}}>
                                {combos.map((c, idx) => {
                                    const valor = formataPreco(
                                        precoComPercentual(precoFinal.precoPor, c.percentual)
                                    );

                                    return (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 3,
                                            }}
                                        >
                                            <Typography variant="h3" sx={{mb: 0, fontWeight: 400, fontSize: '20px'}}>
                                                Leve {c.quantidade} unidades ou mais e pague:
                                            </Typography>

                                            <Typography variant="h3" sx={{
                                                mb: 0,
                                                fontWeight: 400,
                                                fontSize: '28px',
                                                whiteSpace: "nowrap",
                                                mr: 5.6
                                            }}>
                                                {valor}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        <Typography variant="h2" sx={{mb: 1, color: '#333', fontSize: '22px', fontWeight: 400}}>
                            Quantidade Estoque: {calcularEstoqueTotal(grupo)}
                        </Typography>

                        {tipo === "VAR_TAMANHO" && <TabelaPorTamanho grupo={grupo}/>}
                        {tipo === "VAR_COR" && <TabelaPorCor grupo={grupo}/>}
                        {tipo === "VAR_AMBOS" && <TabelaMatriz grupo={grupo}/>}
                        {tipo === "FIXO" && (
                            <Typography variant="h3" sx={{mb: 1, color: '#333', fontSize: '18px', fontWeight: 400}}>
                                Sem variação.
                            </Typography>
                        )}
                    </div>
                );
            })}
        </>
    );
}
