// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import CampoDeBusca from '../components/busca';
import TabelaEstoque from '../components/tabela';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';

localStorage.setItem("username", "João Victor")

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [ean, setEan] = useState('');
  const [submittedEan, setSubmittedEan] = useState('');

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (!user) {
      navigate("/Login");
    } else {
      setUsername(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/Login");
  };

  const data = {
    items: [
      { productName: "CALÇA 38 MASC JEANS AZUL", colorName: "AZUL", sizeName: "38", referenceCode: "4001", balances: [{ stock: 5 }] },
      { productName: "CALÇA MASC JEANS AZUL 40", colorName: "AZUL", sizeName: "40", referenceCode: "4001", balances: [{ stock: 3 }] },
      { productName: "CALÇA MASC JEANS AZUL 42", colorName: "AZUL", sizeName: "42", referenceCode: "4001", balances: [{ stock: 7 }] },
      { productName: "CALÇA MASC JEANS AZUL 44", colorName: "AZUL", sizeName: "44", referenceCode: "4001", balances: [{ stock: 7 }] },
      { productName: "CALÇA MASC JEANS AZUL 46", colorName: "AZUL", sizeName: "46", referenceCode: "4001", balances: [{ stock: 7 }] },
      { productName: "CALÇA MASC JEANS AZUL 48", colorName: "AZUL", sizeName: "48", referenceCode: "4001", balances: [{ stock: 7 }] },
      { productName: "CALÇA MASC JEANS PRETO 38", colorName: "PRETO", sizeName: "38", referenceCode: "4001", balances: [{ stock: 2 }] },
      { productName: "CALÇA MASC JEANS PRETO 40", colorName: "PRETO", sizeName: "40", referenceCode: "4001", balances: [{ stock: 4 }] },
      { productName: "CALÇA MASC JEANS PRETO 42", colorName: "PRETO", sizeName: "42", referenceCode: "4001", balances: [{ stock: 6 }] },
      { productName: "CALÇA MASC JEANS CINZA 38", colorName: "CINZA", sizeName: "38", referenceCode: "4001", balances: [{ stock: 1 }] },
      { productName: "CALÇA MASC JEANS CINZA 40", colorName: "CINZA", sizeName: "40", referenceCode: "4001", balances: [{ stock: 0 }] },
      { productName: "CALÇA MASC JEANS CINZA 42", colorName: "CINZA", sizeName: "42", referenceCode: "4001", balances: [{ stock: 2 }] },
    ]
  };

  return (
    <div>
      <Header username={username} onLogout={handleLogout} />
      <div style={{ padding: 24 }}>


        <CampoDeBusca
          value={ean}
          onChange={setEan}
          onSubmit={() => setSubmittedEan(ean)}
        />

        {submittedEan && (
          <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
            Resultado da busca por: <strong>{submittedEan}</strong>
          </Typography>
        )}

        <TabelaEstoque data={data.items} />
      </div>
    </div>

  );
}
