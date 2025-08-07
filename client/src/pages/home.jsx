import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import CampoDeBusca from '../components/busca';
import TabelaEstoque from '../components/tabela';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';
import { getPrecoPorGrupo } from '../service/price.services';
import { getEstoque } from '../service/stock.services';
import { getSku } from '../service/ean';
import { loginAutomatico } from '../service/login.services';
import BuscaDesc from '../components/buscaDesc';
import { getDesc } from '../service/cnpj.services';

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [ean, setEan] = useState('');
  const [submittedEan, setSubmittedEan] = useState('');
  const [estoque, setEstoque] = useState([]);
  const [preco, setPreco] = useState([]);
  const [cnpj, setCnpj] = useState('');
  const [desc, setDesc] = useState('');
  const [submittedCnpj, setSubmittedCnpj] = useState('');
  const [msgErro, setMsgErro] = useState('');

  useEffect(() => {
    console.log('[useEffect] Verificando username em sessionStorage...');
    const user = sessionStorage.getItem('username');
    if (!user) {
      // navigate('/Login'); ATIVAR NOVAMENTE QUANDO VOLTAR O LOGIN
      // LOGIN AUTOMATICO
      console.log('[useEffect] Sem usuário logado, executando loginAutomatico');
      loginAutomatico().then(() => {
        const usuario = sessionStorage.getItem('username');
        if (usuario) {
          console.log('[useEffect] Login automático realizado:', usuario);
          setUsername(usuario);
        } else {
          console.warn('[useEffect] Login automático falhou.');
        }
      });
    } else {
      console.log('[useEffect] Usuário já logado:', user);
      setUsername(user);
    }
  }, []);

  const isEan = (codigo) => /^\d{13,}$/.test(codigo); // 13+ dígitos = EAN

  const handleSearch = async (valor) => {
    console.log('[handleSearch] Valor recebido:', valor);

    if (!valor || valor.trim() === '') {
      setEan('');
      setSubmittedEan('');
      setPreco(null);
      setEstoque([]);
      console.log('[handleSearch] Valor vazio, limpando states');
      return;
    }

    setEan(valor);
    setSubmittedEan(valor);
    console.log('[handleSearch] State EAN setado:', valor);

    if (isEan(valor)) {
      console.log('[handleSearch] Valor é um EAN válido:', valor);
      const sku = await getSku(valor);
      console.log('[handleSearch] getSku retorno:', sku);

      if (sku === null) {
        setMsgErro('Produto não encontrado');
        setPreco(null);
        setEstoque([]);
        console.warn('[handleSearch] Produto não encontrado para EAN:', valor);
        return;
      } else {
        setMsgErro('');
      }

      const precoData = await getPrecoPorGrupo(sku);
      console.log('[handleSearch] getPrecoPorGrupo retorno:', precoData);

      setPreco(precoData);

      if (!precoData?.referenceCode) {
        console.warn('[handleSearch] precoData sem referenceCode:', precoData);
        setEstoque([]);
        return;
      }

      const estoqueData = await getEstoque(precoData.referenceCode);
      console.log('[handleSearch] getEstoque retorno:', estoqueData);

      setEstoque(estoqueData);
      return;
    }

    try {
      console.log('[handleSearch] Buscando por descrição/SKU:', valor);
      const precoData = await getPrecoPorGrupo(valor);
      console.log('[handleSearch] getPrecoPorGrupo retorno:', precoData);

      setPreco(precoData);

      if (!precoData?.referenceCode) {
        console.warn('[handleSearch] precoData sem referenceCode:', precoData);
        setEstoque([]);
        return;
      }

      const estoqueData = await getEstoque(precoData.referenceCode);
      console.log('[handleSearch] getEstoque retorno:', estoqueData);

      setEstoque(estoqueData);
    } catch (error) {
      console.error('[handleSearch] Erro ao buscar estoque:', error);
      setPreco(null);
      setEstoque([]);
    }
  };

  const handleSearchCNPJ = async (valor) => {
    console.log('[handleSearchCNPJ] Valor recebido:', valor);

    if (!valor || valor.trim() === '') {
      setCnpj('');
      setSubmittedCnpj('');
      setDesc('');
      console.log('[handleSearchCNPJ] Valor vazio, limpando states');
      return;
    }

    setCnpj(valor);
    setSubmittedCnpj(valor);
    console.log('[handleSearchCNPJ] State CNPJ setado:', valor);

    try {
      const descricao = await getDesc(valor);
      console.log('[handleSearchCNPJ] getDesc retorno:', descricao);
      setDesc(descricao);
    } catch (error) {
      console.error('[handleSearchCNPJ] Erro ao buscar descrição do CNPJ:', error);
      setDesc('');
    }
  };

  const handleLogout = () => {
    console.log('[handleLogout] Realizando logout e limpando sessionStorage');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    navigate('/Login');
  };

  const validaDesc = (desc) => {
    if (desc === '1') {
      console.log('[validaDesc] Corrigindo desconto de 1% para 10%');
      return desc = '10'
    }
    return desc;
  }

  // Log de props para a tabela, para ajudar debugging visual
  useEffect(() => {
    console.log('[TabelaEstoque props] data:', estoque, 'preco:', preco?.price, 'desconto:', validaDesc(desc));
  }, [estoque, preco, desc]);

  return (
    <div>
      <Header username={username} onLogout={handleLogout} />

      <div style={{ padding: 24 }}>
        <BuscaDesc
          value={cnpj}
          onChange={setCnpj}
          onSubmit={handleSearchCNPJ}
        />

        {cnpj !== '' && (
          desc === ''
            ? (
              <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
                <strong>Usuário sem desconto</strong>
              </Typography>
            )
            : (
              <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
                Desconto: <strong>{validaDesc(desc)}%</strong>
              </Typography>
            )
        )}

        <CampoDeBusca
          value={ean}
          onChange={setEan}
          onSubmit={handleSearch}
        />

        {submittedEan && (
          <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
            Resultado da busca por: <strong>{submittedEan}</strong>
          </Typography>
        )}

        {msgErro !== '' && (
          <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
            <strong>{msgErro}</strong>
          </Typography>
        )}

        <TabelaEstoque data={estoque} preco={preco?.price} desconto={validaDesc(desc)} />
      </div>
    </div>
  );
}