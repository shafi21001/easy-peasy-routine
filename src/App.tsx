import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import HowToUse from './pages/HowToUse';
import ViewRoutines from './pages/ViewRoutines';
import Wizard from './pages/Wizard';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/view-routines" element={<ViewRoutines />} />
          <Route path="/wizard" element={<Wizard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;