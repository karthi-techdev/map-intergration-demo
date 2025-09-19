import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapInterface from './Map';
import AddListing from './Add-Listing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapInterface />} />
        <Route path="/add-listing" element={<AddListing />} />
      </Routes>
    </Router>
  );
}

export default App;