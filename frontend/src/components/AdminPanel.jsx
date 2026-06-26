import React from 'react';

const AdminPanel = () => {
  return (
    <div className="card text-center p-5 mt-4">
      <h3 className="text-primary mb-3">Admin Panel</h3>
      <p className="lead">Here, an admin user can manage Quizzes and Questions.</p>
      <p className="text-muted">(CRUD operations can be hooked up here to the /api/quizzes and /api/questions endpoints using your admin token.)</p>
    </div>
  );
};

export default AdminPanel;
