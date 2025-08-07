import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DataEntry from './pages/DataEntry'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DataEntry />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App 