import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import QuizList from './QuizList';
import QuizDetail from './QuizDetail';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2>Dashboard</h2>
        <span className="text-muted">Welcome, {user?.username}</span>
      </div>
      
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 px-3 rounded">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard/quizzes">Quiz</Link>
          </li>
          {user?.admin && (
            <li className="nav-item">
              <Link className="nav-link text-primary fw-bold" to="/dashboard/admin">Admin Panel</Link>
            </li>
          )}
          <li className="nav-item">
            <button className="btn btn-link nav-link text-danger" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<h4></h4>} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        {user?.admin && <Route path="/admin" element={<AdminPanel />} />}
      </Routes>
    </div>
  );
};

export default Dashboard;
