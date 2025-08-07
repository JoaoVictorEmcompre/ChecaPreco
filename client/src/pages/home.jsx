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
    const user = sessionStorage.getItem('username');
    if (!user) {
      // navigate('/Login'); ATIVAR NOVAMENTE QUANDO VOLTAR O LOGIN
      // LOGIN AUTOMATICO
      loginAutomatico().then(() => {
        const usuario = sessionStorage.getItem('username');
        if (usuario) {
          setUsername(usuario);
        }
      });
    } else {
      setUsername(user);
    }
  }, []);

  const isEan = (codigo) => /^\d{13,}$/.test(codigo); // 13+ dígitos = EAN

  const handleSearch = async (valor) => {
    if (!valor || valor.trim() === '') {
      setEan('');
      setSubmittedEan('');
      setPreco(null);
      setEstoque([]);
      return;
    }

    setEan(valor);
    setSubmittedEan(valor);

    if (isEan(valor)) {
      const sku = await getSku(valor);

      console.log(sku)
      if (sku === null) {
        setMsgErro('Produto não encontrado');
        setPreco(null);
        setEstoque([]);
        return;
      } else {
        setMsgErro('');
      }

      const precoData = await getPrecoPorGrupo(sku);
      setPreco(precoData);

      const estoqueData = await getEstoque(precoData.referenceCode);
      setEstoque(estoqueData);
      return;
    }

    try {
      const precoData = await getPrecoPorGrupo(valor);
      setPreco(precoData);

      const estoqueData = await getEstoque(precoData.referenceCode);
      setEstoque(estoqueData);
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      setPreco(null);
      setEstoque([]);
    }
  };

  const handleSearchCNPJ = async (valor) => {
    if (!valor || valor.trim() === '') {
      setCnpj('');
      setSubmittedCnpj('');
      setDesc('');
      return;
    }

    setCnpj(valor);
    setSubmittedCnpj(valor);

    try {
      const descricao = await getDesc(valor);
      setDesc(descricao);
    } catch (error) {
      console.error('Erro ao buscar descrição do CNPJ:', error);
      setDesc('');
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    navigate('/Login');
  };

  const validaDesc = (desc) => {
    if (desc === '1') {
      return desc = '10'
    }
    return desc;
  }

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