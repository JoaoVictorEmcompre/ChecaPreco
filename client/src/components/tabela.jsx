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
    fontWeight: 600,
    fontSize: 14,
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
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

function TabelaPorTamanho({ grupo }) {
  console.log('[TabelaEstoque] Renderizando TabelaPorTamanho | grupo:', grupo);
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
                <StyledTableCell align="center" sx={{
                  color: estoque <= 0 ? '#CB3B31' : 'inherit',
                  backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                  fontWeight: estoque <= 0 ? 600 : 400,
                }} >
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
  console.log('[TabelaEstoque] Renderizando TabelaPorCor | grupo:', grupo);
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
                <StyledTableCell align="center" sx={{
                  color: estoque <= 0 ? '#CB3B31' : 'inherit',
                  backgroundColor: estoque <= 0 ? '#fcf5ca' : 'inherit',
                  fontWeight: estoque <= 0 ? 600 : 400,
                }} >
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

        console.log('[TabelaEstoque] Grupo ref:', ref, '| tipo:', tipo, '| nomeBase:', nomeBase, '| grupo:', grupo);

        return (
          <div key={ref}>
            <Typography variant="h1" sx={{ mb: 2, fontWeight: 500, fontSize: 30, color: '#333' }}>
              {nomeBase}
            </Typography>

            {desconto > 0 && (
              <Typography variant="body2" sx={{ fontSize: 16, fontWeight: 400, color: '#888', textDecoration: 'line-through', mb: 0 }} >
                De: {formataPreco(preco)}
              </Typography>
            )}

            <Typography variant="h1" sx={{ mb: 0, fontWeight: 600, fontSize: 34 }} >
              Por: {formataPreco(precoComDesconto(preco, desconto))}
            </Typography>

            <Typography variant='h3' sx={{ mb: 2, fontWeight: 500, fontSize: 15, color: '#333' }}>
              Preço líquido para você
            </Typography>

            {Array.isArray(combos) && combos.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {combos.map((c, idx) => (
                  <Typography key={idx} variant="h3" sx={{ fontSize: 15, mb: 0 }}>
                    {`Leve ${c.quantidade} unidades ou mais e pague apenas ${formataPreco(precoComPercentual(preco, c.percentual))}`}
                  </Typography>
                ))}
              </Box>
            )}

            <Typography variant="h2" sx={{ mb: 1, fontSize: 22, fontWeight: 500, color: '#333' }}>
              {calcularEstoqueTotal(grupo)} unidades disponíveis!
            </Typography>

            {tipo === "VAR_TAMANHO" && <TabelaPorTamanho grupo={grupo} />}
            {tipo === "VAR_COR" && <TabelaPorCor grupo={grupo} />}
            {tipo === "VAR_AMBOS" && <TabelaMatriz grupo={grupo} />}
            {tipo === "FIXO" && <p>Sem variação.</p>}
          </div>
        );
      })}
    </>
  );
}
