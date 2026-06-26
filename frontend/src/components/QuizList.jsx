import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../store/quizSlice';
import { Link } from 'react-router-dom';

const QuizList = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.quizzes);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuizzes());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <div>Loading quizzes...</div>;
  if (status === 'failed') return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h3 className="mb-4">Click and do Quiz</h3>
      <div className="list-group">
        {list.map((quiz) => (
          <Link key={quiz._id} to={`/dashboard/quiz/${quiz._id}`} className="list-group-item list-group-item-action">
            {quiz.title}
          </Link>
        ))}
        {list.length === 0 && <p>No quizzes available.</p>}
      </div>
    </div>
  );
};

export default QuizList;
