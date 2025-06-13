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
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'gray', fontSize: 14 }}>Arraste para o lado ↔</Typography>
      <TableContainer component={Paper} sx={{ mb: 4, overflowX: 'auto' }}>
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
                    <StyledTableCell key={t} align="center" sx={{ color: estoque <= 0 ? 'red' : 'inherit', backgroundColor: estoque <= 0 ? '#fcf5ca' : '' }}>
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
            <StyledTableCell align="center">Estoque</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grupo.map((item, idx) => {
            const estoque = item.balances?.[0]?.stock ?? 0;
            return (
              <StyledTableRow key={idx}>
                <StyledTableCell>{item.sizeName}</StyledTableCell>
                <StyledTableCell align="center" sx={{ color: estoque <= 0 ? 'red' : 'inherit', backgroundColor: estoque <= 0 ? '#fcf5ca' : '', }} >
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

function TabelaPorCor({ grupo }) {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                <StyledTableCell align="center" sx={{ color: estoque <= 0 ? 'red' : 'inherit', backgroundColor: estoque <= 0 ? '#fcf5ca' : '', }} >
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

export default function TabelaEstoque({ data, preco }) {
  const agrupado = agruparPorReferencia(data);
  return (
    <>
      {Object.entries(agrupado).map(([ref, grupo]) => {
        const tipo = identificarTipoGrupo(grupo);
        const nomeBase = formatarNomeProduto(grupo[0].productName, grupo, tipo);
        return (
          <div key={ref}>
            <Typography variant="h1" sx={{ mb: 2, fontWeight: '500', fontSize: 34 }}>
              {nomeBase}
            </Typography>

            <Typography variant="h1" sx={{ mb: 0, fontWeight: '600', fontSize: 36 }}>
              {formataPreco(preco)}
            </Typography>

            <Typography variant='h3' sx={{ mb: 2, fontWeight: '500', fontSize: 15 }}>
              Preço líquido para você
            </Typography>

            <Typography variant='h2' sx={{ mb: 1, fontSize: 24 }}>
              {calcularEstoqueTotal(grupo)} unidades disponíveis!
            </Typography>

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