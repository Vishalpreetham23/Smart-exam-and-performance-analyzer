import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const AttemptExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [exam, setExam] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warningCount, setWarningCount] = useState(0);

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data);
        setTimeLeft(res.data.duration * 60); // Convert minutes to seconds
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam. You may have already submitted it.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // Timer & Auto Submit Logic
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]); // Depend on submitting to stop timer after submit

  // Anti-cheating: Disable Copy/Paste and Context Menu, Track Tab Visibility
  useEffect(() => {
    if (!exam || submitting) return;

    const handleCopyPaste = (e) => e.preventDefault();
    const handleContextMenu = (e) => e.preventDefault();
    
    // Visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // Auto submit after 3 warnings
            alert("Exam auto-submitted due to multiple tab switches.");
            handleSubmitExam();
          } else {
            alert(`Warning ${newCount}/3: Please do not switch tabs during the exam!`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exam, submitting]);

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitExam = useCallback(async () => {
    if (submitting || !exam) return;
    setSubmitting(true);
    
    // Format answers array
    const formattedAnswers = exam.questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] !== undefined ? answers[q._id] : null
    }));

    const timeTaken = Math.ceil((exam.duration * 60 - timeLeft) / 60);

    try {
      console.log("Submitting exam answers for exam:", exam._id);
      await api.post(`/submissions/${exam._id}`, {
        answers: formattedAnswers,
        timeTaken: timeTaken === 0 ? 1 : timeTaken,
      });

      // Redirection to dashboard with results view as requested
      navigate('/dashboard?view=results', { replace: true });
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || err.message || 'Error submitting exam');
      setSubmitting(false);
    }
  }, [answers, exam, timeLeft, submitting, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  if (error) return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-premium text-center">
      <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Notice</h2>
      <p className="text-gray-700 mb-6">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition shadow-md">Back to Dashboard</button>
    </div>
  );

  if (!exam || !exam.questions || exam.questions.length === 0) return <div>No questions found for this exam.</div>;

  const currentQuestion = exam.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === exam.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto select-none py-6">
      {/* Header / Timer */}
      <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-4 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center sticky top-4 z-50">
        <div>
          <h1 className="text-xl font-bold text-gray-800 line-clamp-1">{exam.title}</h1>
          <p className="text-sm text-gray-700">Question {currentQuestionIdx + 1} of {exam.questions.length}</p>
        </div>
        
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Time Remaining</span>
            <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-gray-50 text-gray-700 border border-gray-100 shadow-inner'}`}>
              <Clock size={24} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to submit the exam early?")) {
                handleSubmitExam();
              }
            }}
            disabled={submitting}
            className="hidden md:flex items-center gap-2 py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200"
          >
            End Test
          </button>
        </div>
      </div>

      {warningCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-500 font-medium">
                Warning: Application switching detected. ({warningCount}/3)
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-600 mt-1">Your exam will be auto-submitted if you continue to switch tabs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-10 mb-6 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
            <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">{currentQuestionIdx + 1}.</span> 
            {currentQuestion.text}
          </h2>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-semibold text-sm whitespace-nowrap">
            {currentQuestion.marks} Marks
          </span>
        </div>

        <div className="space-y-4 flex-grow">
          {currentQuestion.options.map((option, idx) => (
            <label 
              key={idx} 
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 
                ${answers[currentQuestion._id] === idx 
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }`}
            >
              <input 
                type="radio"
                name={`question-${currentQuestion._id}`}
                value={idx}
                checked={answers[currentQuestion._id] === idx}
                onChange={() => handleOptionSelect(currentQuestion._id, idx)}
                className="w-5 h-5 text-primary-500 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
              />
              <span className={`ml-4 text-lg ${answers[currentQuestion._id] === idx ? 'text-primary-900 dark:text-primary-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
          disabled={currentQuestionIdx === 0}
          className="flex items-center gap-2 py-3 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={20} />
          Previous
        </button>
        
        <div className="flex gap-2 font-medium text-gray-500 dark:text-gray-400">
          {exam.questions.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentQuestionIdx(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer
                ${currentQuestionIdx === idx ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-500' 
                : answers[exam.questions[idx]._id] !== undefined ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="flex items-center gap-2 py-3 px-8 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow disabled:opacity-70 dark:bg-green-500"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
            <CheckCircle size={20} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
            className="flex items-center gap-2 py-3 px-8 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Next
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttemptExam;
