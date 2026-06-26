import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchQuizById } from '../store/quizSlice';

const QuizDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz } = useSelector((state) => state.quizzes);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuizById(id));
  }, [dispatch, id]);

  if (!currentQuiz) return <div>Loading quiz details...</div>;

  const handleOptionChange = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let currentScore = 0;
    currentQuiz.questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center mt-5">
        <h2 className="mb-4">Quiz Completed</h2>
        <p className="lead mb-4">Your score: {score}</p>
        <button className="btn btn-primary px-4 py-2" onClick={() => {
          setSubmitted(false);
          setAnswers({});
          setScore(0);
        }}>Restart Quiz</button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="mb-4">{currentQuiz.title}</h2>

      <form onSubmit={handleSubmit} className="text-start mx-auto" style={{ maxWidth: '600px' }}>
        {currentQuiz.questions.map((q, idx) => (
          <div key={q._id} className="mb-4 pb-3 border-bottom">
            <h5>{idx + 1}. {q.text}</h5>
            {q.options.map((opt, optIdx) => (
              <div className="form-check" key={optIdx}>
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name={`question-${q._id}`} 
                  id={`q-${q._id}-opt-${optIdx}`} 
                  value={optIdx}
                  onChange={() => handleOptionChange(q._id, optIdx)}
                  checked={answers[q._id] === optIdx}
                  disabled={submitted}
                  required
                />
                <label className="form-check-label" htmlFor={`q-${q._id}-opt-${optIdx}`}>
                  {opt}
                </label>
              </div>
            ))}
            {/* Correct answer feedback removed from test form as it's now handled by the completion screen */}
          </div>
        ))}
        <button type="submit" className="btn btn-primary mt-3 px-5 d-block mx-auto">Submit Answer</button>
      </form>
    </div>
  );
};

export default QuizDetail;
