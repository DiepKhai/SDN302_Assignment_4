import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, addQuestion, deleteQuestion, updateQuestion } from '../store/questionSlice';

const ManageQuestions = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.questions);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuestions());
    }
  }, [status, dispatch]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    dispatch(addQuestion({ text, options, correctAnswerIndex: Number(correctAnswer) }));
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      dispatch(deleteQuestion(id));
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestion({ ...q });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(updateQuestion({
      id: editingQuestion._id,
      questionData: {
        text: editingQuestion.text,
        options: editingQuestion.options,
        correctAnswerIndex: Number(editingQuestion.correctAnswerIndex)
      }
    }));
    setEditingQuestion(null);
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  return (
    <div>
      <h3 className="mb-4">Questions</h3>
      
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleAddQuestion}>
            <div className="row mb-3 align-items-center">
              <label className="col-sm-3 col-form-label text-end">Question Text:</label>
              <div className="col-sm-9">
                <input type="text" className="form-control" value={text} onChange={(e) => setText(e.target.value)} required />
              </div>
            </div>

            <div className="row mb-3 align-items-start">
              <label className="col-sm-3 col-form-label text-end mt-1">Options:</label>
              <div className="col-sm-9">
                {options.map((opt, idx) => (
                  <input key={idx} type="text" className="form-control mb-2" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} required />
                ))}
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label className="col-sm-3 col-form-label text-end">Correct Answer Index:</label>
              <div className="col-sm-9">
                <input type="number" className="form-control" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} min="0" max={options.length - 1} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2">Add Question</button>
          </form>
        </div>
      </div>

      <div className="list-group">
        {list.map((q) => (
          <div key={q._id} className="list-group-item">
            <h5 className="mb-3">{q.text}</h5>
            <ul>
              {q.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
            <div className="mt-3">
              <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(q)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted p-3 text-center">No questions available.</div>}
      </div>

      {editingQuestion && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Question</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingQuestion(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Question Text:</label>
                    <input type="text" className="form-control" value={editingQuestion.text} onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Options:</label>
                    {editingQuestion.options.map((opt, idx) => (
                      <input key={idx} type="text" className="form-control mb-2" value={opt} onChange={(e) => handleEditOptionChange(idx, e.target.value)} required />
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correct Answer Index:</label>
                    <input type="number" className="form-control" value={editingQuestion.correctAnswerIndex ?? 0} onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: e.target.value })} min="0" max={editingQuestion.options.length - 1} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingQuestion(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
