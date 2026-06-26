import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import ManageQuestions from './ManageQuestions';
import ManageQuizzes from './ManageQuizzes';
import QuizAdminDetail from './QuizAdminDetail';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
        <h2>Admin Dashboard</h2>
        <span className="text-muted">Welcome, {user?.username}</span>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 px-3 rounded">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/admin">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin/quizzes">Manage Quizzes</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin/questions">Manage Questions</Link>
          </li>
          <li className="nav-item">
            <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<h4></h4>} />
        <Route path="/quizzes" element={<ManageQuizzes />} />
        <Route path="/quizzes/:id" element={<QuizAdminDetail />} />
        <Route path="/questions" element={<ManageQuestions />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
