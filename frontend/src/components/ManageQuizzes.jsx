import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, createQuiz, deleteQuiz, editQuiz } from '../store/quizSlice';
import { Link } from 'react-router-dom';

const ManageQuizzes = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.quizzes);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuizzes());
    }
  }, [status, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(editQuiz({ id: editingId, quizData: { title, description } }));
      setEditingId(null);
    } else {
      dispatch(createQuiz({ title, description }));
    }
    setTitle('');
    setDescription('');
  };

  const handleEditClick = (quiz) => {
    setEditingId(quiz._id);
    setTitle(quiz.title);
    setDescription(quiz.description);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      dispatch(deleteQuiz(id));
    }
  };

  return (
    <div>
      <h3 className="mb-4">Manage Quizzes</h3>
      
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3 align-items-center">
              <label className="col-sm-2 col-form-label text-end">Title:</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label className="col-sm-2 col-form-label text-end">Description:</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            <button type="submit" className={editingId ? "btn btn-warning w-100 mt-2" : "btn btn-primary w-100 mt-2"}>
              {editingId ? "Update Quiz" : "Create Quiz"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="list-group">
        {list.map((quiz) => (
          <div key={quiz._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{quiz.title}</h5>
              <small className="text-muted">{quiz.description}</small>
            </div>
            <div>
              <Link to={`/admin/quizzes/${quiz._id}`} className="btn btn-info btn-sm me-2 text-white">Manage Questions</Link>
              <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(quiz)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz._id)}>Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted p-3 text-center">No quizzes available.</div>}
      </div>
    </div>
  );
};

export default ManageQuizzes;
