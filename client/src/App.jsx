import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './pages/login'
import HomePage from './pages/home'
import './App.css'

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#CB3B31',
        light: '#e57373',
        dark: '#a52a22',
        contrastText: '#fff',
      },
      background: {
        default: '#f8f9fb',
        paper: '#ffffff',
      },
      text: {
        primary: '#1a1a2e',
        secondary: '#64748b',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", sans-serif',
      h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
      h2: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
      h3: { fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', fontWeight: 500 },
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: '1px solid rgba(0,0,0,0.06)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' },
          body: { fontSize: '0.8rem' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
