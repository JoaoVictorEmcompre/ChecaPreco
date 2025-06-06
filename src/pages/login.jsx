import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Styled components
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
    '&:hover': {
      backgroundColor: '#eeeeee',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
    },
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

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;

    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'Usuário é obrigatório';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', 'bandvestapiv2');
      params.append('client_secret', '4776436009');
      params.append('username', formData.usuario);
      params.append('password', formData.password);

      const response = await axios.post(
        'https://ws.facolchoes.com.br:9443/api/totvsmoda/authorization/v2/token',
        params
      );

      const token = response.data.access_token;
      localStorage.setItem('authToken', token);
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.status === 401 || error.response?.status === 400) {
        setLoginError('Usuário ou senha incorretos');
      } else {
        setLoginError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navegar para recuperação de senha');
  };

  const handleRegister = () => {
    console.log('Navegar para cadastro');
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: '#CB3B31',
            textAlign: 'center'
          }}
        >
          Entrar na Conta
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Acesse sua conta empresarial
        </Typography>

        {loginError && (
          <Alert
            severity="error"
            sx={{ width: '100%', mb: 2, borderRadius: 2 }}
          >
            {loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <StyledTextField
            margin="normal"
            required
            fullWidth
            id="usuario"
            label="Usuário"
            name="usuario"
            autoComplete="username"
            autoFocus
            value={formData.usuario}
            onChange={handleInputChange('usuario')}
            error={!!errors.usuario}
            helperText={errors.usuario}
            placeholder="Digite seu usuário"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            placeholder="Digite sua senha"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Entrar'
            )}
          </StyledButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Esqueceu sua senha?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{
                  textDecoration: 'none',
                  color: '#CB3B31',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Recuperar
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ainda não tem uma conta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleRegister}
                sx={{
                  textDecoration: 'none',
                  color: '#CB3B31',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Login;
