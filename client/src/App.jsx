import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import HomePage from './pages/home'
import './App.css'

export default function App() {
  return (
    <Router >
      <Routes>
        <Route path='/Login' element={<Login />} />
        <Route path='/' element={<HomePage />} />
      </Routes>
    </Router>
  )
}