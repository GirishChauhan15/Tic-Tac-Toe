import Layout from './Layout';
import {Home, JoinRoom, NotFound} from './pages'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
<BrowserRouter>
<Routes>
  <Route element={<Layout />} path="/">
    <Route element={<Home />} path="" />
    <Route element={<JoinRoom />} path="/joinRoom/:playerName/:roomCode" />
    <Route element={<NotFound />} path="*" /> 404
  </Route>
</Routes>
</BrowserRouter>
  );
}

export default App;
