import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import Login from './pages/login'
import HomePage from './pages/home'
import './App.css'

export default function App() {
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