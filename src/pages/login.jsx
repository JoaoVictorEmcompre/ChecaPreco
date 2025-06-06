import React, { useState } from 'react';
import { Box, Container, Paper, TextField, Button, Typography, Link, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Styled components for better design
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
    cnpj: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Format CNPJ as user types
  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    if (field === 'cnpj') {
      value = formatCNPJ(value);
      // Limit to 14 numbers
      if (value.replace(/\D/g, '').length > 14) return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
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
      // Replace with your actual API endpoint
      const response = await axios.post('/api/auth/login', {
        cnpj: formData.cnpj.replace(/\D/g, ''), // Send only numbers
        password: formData.password
      });
      
      // Handle successful login
      console.log('Login successful:', response.data);
      
      // Store token (adjust based on your API response)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // Redirect to dashboard or main app
        window.location.href = '/dashboard';
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        setLoginError('CNPJ ou senha incorretos');
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log('Navigate to forgot password');
  };

  const handleRegister = () => {
    // Navigate to registration page
    console.log('Navigate to registration');
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
            id="cnpj"
            label="CNPJ"
            name="cnpj"
            autoComplete="username"
            autoFocus
            value={formData.cnpj}
            onChange={handleInputChange('cnpj')}
            error={!!errors.cnpj}
            helperText={errors.cnpj}
            placeholder="00.000.000/0000-00"
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
            <typography variant="body2" color="text.secondary">
                Esqueceu sua senha? {' '}
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
            </typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <typography variant="body2" color="text.secondary">
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
            </typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};



// ================================
// App.jsx (Main App Component)
// ================================

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#CB3B31',
    },
    secondary: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login />
    </ThemeProvider>
  );
}

export default App;

// ================================
// package.json dependencies
// ================================

/*
{
  "name": "login-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "vite": "^5.0.0"
  }
}
*/

// ================================
// Installation Commands
// ================================

/*
# Create Vite React project
npm create vite@latest login-app -- --template react
cd login-app

# Install Material-UI and dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install axios

# Run development server
npm run dev
*/