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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#CB3B31',
    color: theme.palette.common.white,
    border: '1px solid black',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    border: '1px solid black',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({}));

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

function extrairNomeBase(productName, sizeName, colorName) {
  let base = productName;
  const cleanSize = sizeName?.trim().toUpperCase();
  const cleanColor = colorName?.trim().toUpperCase();
  base = base.toUpperCase();
  if (cleanSize) base = base.replace(new RegExp(`\\b${cleanSize}\\b`, 'gi'), '').trim();
  if (cleanColor) base = base.replace(new RegExp(`\\b${cleanColor}\\b`, 'gi'), '').trim();
  return base.replace(/\s{2,}/g, ' ').trim();
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
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'gray' }}>Arraste para o lado ↔</Typography>
      <TableContainer component={Paper} sx={{ mb: 4, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Cor / Tamanho</StyledTableCell>
              {tamanhos.map(t => <StyledTableCell key={t} align="right">{t}</StyledTableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {cores.map(cor => (
              <StyledTableRow key={cor}>
                <StyledTableCell>{cor}</StyledTableCell>
                {tamanhos.map(t => {
                  const estoque = estoqueMap[`${cor}_${t}`];
                  return (
                    <StyledTableCell key={t} align="right" sx={{ color: estoque === 0 ? 'gray' : 'inherit' }}>
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

function TabelaPorTamanho({ grupo }) {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Tamanho</StyledTableCell>
            <StyledTableCell align="right">Estoque</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grupo.map((item, idx) => (
            <StyledTableRow key={idx}>
              <StyledTableCell>{item.sizeName}</StyledTableCell>
              <StyledTableCell align="right">{item.balances?.[0]?.stock ?? 0}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TabelaPorCor({ grupo }) {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Cor</StyledTableCell>
            <StyledTableCell align="right">Estoque</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grupo.map((item, idx) => (
            <StyledTableRow key={idx}>
              <StyledTableCell>{item.colorName}</StyledTableCell>
              <StyledTableCell align="right">{item.balances?.[0]?.stock ?? 0}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function TabelaEstoque({ data, preco }) {
  const agrupado = agruparPorReferencia(data);
  return (
    <>
      {Object.entries(agrupado).map(([ref, grupo]) => {
        const tipo = identificarTipoGrupo(grupo);
        const nomeBase = extrairNomeBase(grupo[0].productName, grupo[0].sizeName, grupo[0].colorName);
        return (
          <div key={ref}>
            <h2>{nomeBase}</h2>
            <h3>{preco}</h3>
            {tipo === "VAR_TAMANHO" && <TabelaPorTamanho grupo={grupo} />}
            {tipo === "VAR_COR" && <TabelaPorCor grupo={grupo} />}
            {tipo === "VAR_AMBOS" && <TabelaMatriz grupo={grupo} />}
            {tipo === "FIXO" && <p>Produto fixo sem variação.</p>}
          </div>
        );
      })}
    </>
  );
}