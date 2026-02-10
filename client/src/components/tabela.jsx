import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#f8f9fb',
    color: '#64748b',
    border: 'none',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: 700,
    textAlign: 'center',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '10px 12px',
  },
  [`&.${tableCellClasses.body}`]: {
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    padding: '10px 12px',
    fontSize: '0.8rem',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#fafbfc',
  },
  transition: 'background-color 0.15s ease',
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

function StockBadge({ value }) {
  if (value <= 0) {
    return (
      <Chip
        label="0"
        size="small"
        sx={{
          bgcolor: '#fef2f2',
          color: '#dc2626',
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 26,
          minWidth: 40,
        }}
      />
    );
  }
  return (
    <Chip
      label={value}
      size="small"
      sx={{
        bgcolor: '#f0fdf4',
        color: '#16a34a',
        fontWeight: 700,
        fontSize: '0.75rem',
        height: 26,
        minWidth: 40,
      }}
    />
  );
}

function MatrixStockCell({ value }) {
  if (value <= 0) {
    return (
      <Typography
        component="span"
        sx={{
          color: '#dc2626',
          bgcolor: '#fef2f2',
          fontWeight: 700,
          fontSize: '0.75rem',
          borderRadius: 1.5,
          px: 1,
          py: 0.3,
          display: 'inline-block',
        }}
      >
        0
      </Typography>
    );
  }
  return (
    <Typography
      component="span"
      sx={{
        color: '#1a1a2e',
        fontWeight: 600,
        fontSize: '0.8rem',
      }}
    >
      {value}
    </Typography>
  );
}

function TabelaMatriz({ grupo }) {
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
    <Box sx={{ position: 'relative' }}>
      <Typography
        variant="caption"
        sx={{
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: '#94a3b8',
          fontSize: '0.7rem',
        }}
      >
        Deslize para ver mais tamanhos
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          mb: 3,
          overflowX: 'auto',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell align='center' sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: '#f8f9fb' }}>
                Cor / Tam
              </StyledTableCell>
              {tamanhos.map(t => <StyledTableCell key={t} align="center">{t}</StyledTableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {cores.map(cor => (
              <StyledTableRow key={cor}>
                <StyledTableCell
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a2e',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    bgcolor: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cor}
                </StyledTableCell>
                {tamanhos.map(t => {
                  const estoque = estoqueMap[`${cor}_${t}`] ?? 0;
                  return (
                    <StyledTableCell key={t} align="center">
                      <MatrixStockCell value={estoque} />
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

function TabelaPorTamanho({ grupo }) {
  console.log('[TabelaEstoque] Renderizando TabelaPorTamanho | grupo:', grupo);
  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
      }}
    >
      <Table size="small">
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
                <StyledTableCell sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {item.sizeName}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <StockBadge value={estoque} />
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TabelaPorCor({ grupo }) {
  console.log('[TabelaEstoque] Renderizando TabelaPorCor | grupo:', grupo);
  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
      }}
    >
      <Table size="small">
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
                <StyledTableCell sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {item.colorName}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <StockBadge value={estoque} />
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

export default function TabelaEstoque({ data, preco, desconto = 0, combos = [] }) {
  console.log('[TabelaEstoque] Render | props:', { data, preco, desconto, combos });
  const agrupado = agruparPorReferencia(data);

  const precoComDesconto = (preco, desconto) => {
    if (desconto === '10') {
      const valorFinal = (9 * preco) / 10;
      return valorFinal;
    }
    return preco;
  }

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
        const estoqueTotal = calcularEstoqueTotal(grupo);
        const temDesconto = desconto > 0;
        const precoFinal = precoComDesconto(preco, desconto);

        console.log('[TabelaEstoque] Grupo ref:', ref, '| tipo:', tipo, '| nomeBase:', nomeBase, '| grupo:', grupo);

        return (
          <Box
            key={ref}
            className="fade-in"
            sx={{
              bgcolor: '#fff',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              p: { xs: 2.5, sm: 3 },
              mb: 3,
            }}
          >
            {/* Product name */}
            <Typography
              variant="h1"
              sx={{
                mb: 2,
                color: '#1a1a2e',
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
              }}
            >
              {nomeBase}
            </Typography>

            {/* Price section */}
            <Box
              sx={{
                bgcolor: '#fafbfc',
                borderRadius: 3,
                p: 2,
                mb: 2.5,
                border: '1px solid #f1f5f9',
              }}
            >
              {temDesconto && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                    fontSize: '0.85rem',
                    mb: 0.3,
                  }}
                >
                  De: {formataPreco(preco)}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography
                  sx={{
                    color: '#CB3B31',
                    fontSize: { xs: '1.6rem', sm: '1.8rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {formataPreco(precoFinal)}
                </Typography>
                {temDesconto && (
                  <Chip
                    label={`-${desconto}%`}
                    size="small"
                    sx={{
                      bgcolor: '#fef2f2',
                      color: '#CB3B31',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 22,
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                Preco liquido para voce
              </Typography>
            </Box>

            {/* Combo offers */}
            {Array.isArray(combos) && combos.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                {combos.map((c, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 2.5,
                      px: 2,
                      py: 1,
                      mb: 1,
                    }}
                  >
                    <LocalOfferOutlinedIcon sx={{ fontSize: '1rem', color: '#d97706' }} />
                    <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                      Leve {c.quantidade} un. ou mais por {formataPreco(precoComPercentual(precoFinal, c.percentual))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Stock summary */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <InventoryOutlinedIcon sx={{ fontSize: '1.1rem', color: estoqueTotal > 0 ? '#16a34a' : '#dc2626' }} />
              <Typography
                variant="h2"
                sx={{
                  color: estoqueTotal > 0 ? '#16a34a' : '#dc2626',
                  fontSize: '1rem',
                }}
              >
                {estoqueTotal} {estoqueTotal === 1 ? 'unidade disponivel' : 'unidades disponiveis'}
              </Typography>
            </Box>

            {/* Stock tables */}
            {tipo === "VAR_TAMANHO" && <TabelaPorTamanho grupo={grupo} />}
            {tipo === "VAR_COR" && <TabelaPorCor grupo={grupo} />}
            {tipo === "VAR_AMBOS" && <TabelaMatriz grupo={grupo} />}
            {tipo === "FIXO" && (
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Produto sem variacao de cor ou tamanho.
              </Typography>
            )}
          </Box>
        );
      })}
    </>
  );
}
