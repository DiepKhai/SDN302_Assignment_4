import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchQuizById, addQuestionToQuiz, removeQuestionFromQuiz } from '../store/quizSlice';
import { fetchQuestions } from '../store/questionSlice';

const QuizAdminDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz } = useSelector((state) => state.quizzes);
  const { list: allQuestions, status: questionsStatus } = useSelector((state) => state.questions);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  useEffect(() => {
    dispatch(fetchQuizById(id));
    if (questionsStatus === 'idle') {
      dispatch(fetchQuestions());
    }
  }, [dispatch, id, questionsStatus]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    dispatch(addQuestionToQuiz({
      quizId: id,
      questionData: { text, options, correctAnswerIndex: Number(correctAnswer) }
    }));
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  };

  const handleAssignQuestion = (e) => {
    e.preventDefault();
    if (!selectedQuestionId) return;
    dispatch(addQuestionToQuiz({
      quizId: id,
      questionData: { questionId: selectedQuestionId }
    }));
    setSelectedQuestionId('');
  };

  const handleRemoveQuestion = (questionId) => {
    if (window.confirm("Are you sure you want to remove this question from the quiz?")) {
      dispatch(removeQuestionFromQuiz({ quizId: id, questionId }));
    }
  };

  if (!currentQuiz) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <Link to="/admin/quizzes" className="btn btn-outline-secondary btn-sm mb-2">&larr; Back to Quizzes</Link>
          <h3>Manage: {currentQuiz.title}</h3>
          <p className="text-muted mb-0">{currentQuiz.description}</p>
        </div>
      </div>
      
      <div className="card mb-4 shadow-sm border-info">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Add Question to this Quiz</h5>
        </div>
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
                  <input key={idx} type="text" className="form-control mb-2" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} required placeholder={`Option ${idx + 1}`} />
                ))}
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label className="col-sm-3 col-form-label text-end">Correct Answer Index (0-3):</label>
              <div className="col-sm-9">
                <input type="number" className="form-control" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} min="0" max={options.length - 1} required />
              </div>
            </div>

            <button type="submit" className="btn btn-info text-white w-100 mt-2">Create & Add Question</button>
          </form>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-secondary">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">Assign Existing Question</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAssignQuestion}>
            <div className="row mb-3 align-items-center">
              <label className="col-sm-3 col-form-label text-end">Select Question:</label>
              <div className="col-sm-9">
                <select className="form-select" value={selectedQuestionId} onChange={(e) => setSelectedQuestionId(e.target.value)} required>
                  <option value="">-- Choose a question --</option>
                  {allQuestions.map(q => (
                    <option key={q._id} value={q._id}>{q.text}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-secondary w-100 mt-2" disabled={!selectedQuestionId}>Assign to Quiz</button>
          </form>
        </div>
      </div>

      <h4 className="mb-3">Questions in this Quiz</h4>
      <div className="list-group">
        {currentQuiz.questions?.map((q) => (
          <div key={q._id} className="list-group-item">
            <h5 className="mb-3">{q.text}</h5>
            <ol>
              {q.options.map((opt, idx) => (
                <li key={idx} className={idx === q.correctAnswerIndex ? "fw-bold text-success" : ""}>
                  {opt} {idx === q.correctAnswerIndex && "(Correct)"}
                </li>
              ))}
            </ol>
            <div className="mt-3">
              <button className="btn btn-danger btn-sm" onClick={() => handleRemoveQuestion(q._id)}>Remove from Quiz</button>
            </div>
          </div>
        ))}
        {(!currentQuiz.questions || currentQuiz.questions.length === 0) && (
          <div className="text-muted p-3 text-center">This quiz has no questions yet.</div>
        )}
      </div>
    </div>
  );
};

export default QuizAdminDetail;
