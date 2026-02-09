import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './pages/login'
import HomePage from './pages/home'
import './App.css'

export default function App() {
  const theme = createTheme({
    typography: {
      fontFamily: '"Poppins", sans-serif',
      h1: { fontSize: '1.8rem', fontWeight: 600 },
      h2: { fontSize: '1.28rem', fontWeight: 500 },
      h3: { fontSize: '1.1rem', fontWeight: 400 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: { fontSize: '0.9rem', fontWeight: 600 },
          body: { fontSize: '0.8rem' },
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
