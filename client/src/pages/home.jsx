import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import CampoDeBusca from '../components/busca';
import TabelaEstoque from '../components/tabela';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';
import { getPrecoPorGrupo } from '../service/price.services';
import { getEstoque } from '../service/stock.services';
import { getSku } from '../service/ean';

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [ean, setEan] = useState('');
  const [submittedEan, setSubmittedEan] = useState('');
  const [estoque, setEstoque] = useState([]);
  const [preco, setPreco] = useState([]);

  useEffect(() => {
    const user = sessionStorage.getItem('username');
    if (!user) {
      navigate('/Login');
    } else {
      setUsername(user);
    }
  }, [navigate]);

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


  const handleLogout = () => {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    navigate('/Login');
  };

  return (
    <div>
      <Header username={username} onLogout={handleLogout} />

      <div style={{ padding: 24 }}>
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
        <TabelaEstoque data={estoque} preco={preco?.price} />
      </div>
    </div>
  );
}