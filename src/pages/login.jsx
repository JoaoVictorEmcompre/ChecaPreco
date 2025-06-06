// src/pages/Login.jsx

import React, { useState } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography, Link,
  Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Importando os serviços necessários
import { login } from '../service/login.services';
import { saveToken, saveUsername } from '../service/token';

// --- ESTILOS (MANTIDOS EXATAMENTE COMO VOCÊ CRIOU) ---
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    '&:hover': { backgroundColor: '#eeeeee' },
    '&.Mui-focused': { backgroundColor: '#ffffff' },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 0),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #CB3B31 30%, #e57373 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #b71c1c 30%, #CB3B31 90%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 20px rgba(203, 59, 49, 0.4)',
  },
  transition: 'all 0.3s ease',
}));


// --- COMPONENTE DE LOGIN ---
export default function Login() {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuário é obrigatório';
    if (!formData.password.trim()) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const data = await login(formData.usuario, formData.password);
      
      // Supondo que a API retorna um objeto como { access_token: "...", access_username: "..." }
      if (data.access_token && data.access_username) {
        // Usa os serviços para salvar os dados no localStorage
        saveToken(data.access_token);
        saveUsername(data.access_username);
        
        // Redireciona para o painel principal
        window.location.href = '/dashboard';
      } else {
        // Caso a API retorne sucesso (200) mas sem os dados esperados
        setLoginError('Resposta inválida do servidor.');
      }

    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        setLoginError('Usuário ou senha incorretos.');
      } else {
        setLoginError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        <img
          src="/logo-bandfashion.png" // Garanta que este arquivo esteja na pasta /public
          alt="Bandfashion Logo"
          style={{
            width: '80px',
            marginBottom: '1.5rem',
            marginTop: '-0.5rem',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.15))'
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#CB3B31', textAlign: 'center', mb: 1 }}>
          Entrar na Conta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
          Acesse sua conta empresarial
        </Typography>

        {loginError && (
          <Alert severity="error" sx={{ width: '100%', borderRadius: 2, mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StyledTextField
            fullWidth
            label="Usuário"
            value={formData.usuario}
            onChange={handleInputChange('usuario')}
            error={!!errors.usuario}
            helperText={errors.usuario}
            placeholder="Digite seu usuário"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            placeholder="Digite sua senha"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <StyledButton type="submit" fullWidth variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </StyledButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Esqueceu sua senha?{' '}
            <Link component="button" variant="body2" onClick={() => { /* Lógica de recuperação aqui */ }}>
              Recuperar
            </Link>
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
}