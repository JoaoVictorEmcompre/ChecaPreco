import React, { useState } from 'react';
import { Box, Container, Alert, Button, CircularProgress } from '@mui/material';

import { login } from '../service/login.services';
import { saveToken } from '../service/token';

import LoginWrapper from './loginWrapper';
import UsuarioField from './usuarioField';
import SenhaField from './senhaField'

export default function Login() {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    console.log('[Login] Alteração do campo:', field, '| Novo valor:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuário é obrigatório';
    if (!formData.password.trim()) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.warn('[Login] Validação de formulário falhou:', newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Login] Tentativa de submit com:', formData);

    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');
    console.log('[Login] Enviando requisição para login.services...');

    try {
      const data = await login(formData.usuario, formData.password);
      console.log('[Login] Resposta do serviço:', data);

      if (data.access_token) {
        console.log('[Login] Login bem-sucedido! Salvando token e redirecionando...');
        saveToken(data.access_token);
        sessionStorage.setItem('username', formData.usuario)
        window.location.href = '/';
      } else {
        console.error('[Login] Resposta inválida do servidor (sem access_token)', data);
        setLoginError('Resposta inválida do servidor.');
      }
    } catch (error) {
      console.error('[Login] Erro durante login:', error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        setLoginError('Usuário ou senha incorretos.');
      } else {
        setLoginError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
      console.log('[Login] Fim do submit. loading = false');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <LoginWrapper>
        {loginError && (
          <Alert severity="error" sx={{ width: '100%', borderRadius: 2, mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <UsuarioField
            value={formData.usuario}
            onChange={handleInputChange('usuario')}
            error={errors.usuario}
            helperText={errors.usuario}
            disabled={loading}
          />
          <SenhaField
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            helperText={errors.password}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 3.5,
              padding: '13px 0',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #CB3B31 0%, #a52a22 100%)',
              boxShadow: '0 4px 14px rgba(203, 59, 49, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b71c1c 0%, #8b1a12 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(203, 59, 49, 0.4)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
      </LoginWrapper>
    </Container>
  );
}