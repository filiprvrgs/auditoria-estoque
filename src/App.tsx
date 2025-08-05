import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DataEntry from './pages/DataEntry'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DataEntry />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App 