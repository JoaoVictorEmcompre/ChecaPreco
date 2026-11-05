import {useEffect, useState} from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './pages/login'
import HomePage from './pages/home'
import {loginAutomatico} from './service/login.services.js'
import {getToken} from './service/token.js'
import './App.css'

const theme = createTheme({
    palette: {
        primary: {main: '#CB3B31'},
    },
    typography: {
        fontFamily: '"Poppins", sans-serif',
        h1: {fontSize: '1.8rem', fontWeight: 600},
        h2: {fontSize: '1.28rem', fontWeight: 500},
        h3: {fontSize: '1.1rem', fontWeight: 400},
        body1: {fontSize: '0.875rem'},
        body2: {fontSize: '0.8125rem'},
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {backgroundColor: '#f7f7f8'},
                '::selection': {backgroundColor: 'rgba(203, 59, 49, 0.2)'},
                ':focus-visible': {outline: '2px solid #CB3B31', outlineOffset: 2},
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {fontSize: '0.9rem', fontWeight: 600},
                body: {fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums'},
            },
        },
    },
})

export default function App() {
    const [carregandoLogin, setCarregandoLogin] = useState(true)

    useEffect(() => {
        const iniciarLogin = async () => {
            try {
                if (!getToken()) {
                    await loginAutomatico()
                }
            } catch (error) {
                console.error('Erro ao iniciar login automático:', error)
            } finally {
                setCarregandoLogin(false)
            }
        }

        iniciarLogin()
    }, [])

    if (carregandoLogin) {
        return <div>Carregando...</div>
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/" element={<HomePage/>}/>
                </Routes>
            </Router>
        </ThemeProvider>
    )
}