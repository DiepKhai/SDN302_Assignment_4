import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.admin ? "/admin" : "/dashboard"} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.admin ? "/admin" : "/dashboard"} />} />
        
        <Route path="/dashboard/*" element={isAuthenticated && !user?.admin ? <Dashboard /> : <Navigate to={user?.admin ? "/admin" : "/login"} />} />
        
        <Route path="/admin/*" element={isAuthenticated && user?.admin ? <AdminDashboard /> : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? (user?.admin ? "/admin" : "/dashboard") : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
