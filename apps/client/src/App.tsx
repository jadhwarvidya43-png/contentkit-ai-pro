import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Protected from './components/ProtectedRoute';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Login />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/register" element={
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Register />
            </main>
            <Footer />
          </div>
        } />

        {/* Protected routes */}
        <Route element={<Protected />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Profile />
              </main>
              <Footer />
            </div>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;