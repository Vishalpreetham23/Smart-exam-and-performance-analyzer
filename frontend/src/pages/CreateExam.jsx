import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const CreateExam = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Removed fetchExamData as editing is disabled

  
  // Step 1: Exam Details
  const [examDetails, setExamDetails] = useState({
    title: '',
    description: '',
    duration: 30, // Default 30 minutes
  });

  // Step 2: Questions
  const emptyQuestion = {
    text: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0,
  };
  
  const [questions, setQuestions] = useState([emptyQuestion]);

  const handleExamDetailsChange = (e) => {
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/exams', examDetails);
      setExamId(res.data._id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  const handleSaveQuestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      for (const question of questions) {
        await api.post(`/exams/${examId}/questions`, question);
      }
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in py-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white text-gray-700 hover:text-gray-900 rounded-full shadow-premium hover:shadow-lg transition-all border border-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          Create New Exam
        </h1>
      </div>

      {error && (
        <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-4 rounded-lg mb-6 flex items-center gap-2">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 transition-all duration-500 rounded z-0" 
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        ></div>
        
        <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary-500' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 border-2 border-white'}`}>1</div>
          <span className="text-sm font-semibold">Details</span>
        </div>
        
        <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary-500' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 border-2 border-white'}`}>2</div>
          <span className="text-sm font-semibold">Questions</span>
        </div>
        
        <div className={`relative z-10 flex flex-col items-center gap-2 ${step === 3 ? 'text-primary-500' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 border-2 border-white'}`}>3</div>
          <span className="text-sm font-semibold">Publish</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-8 animate-fade-in relative overflow-hidden">
          <form onSubmit={handleCreateExam} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                name="title"
                value={examDetails.title}
                onChange={handleExamDetailsChange}
                className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-gray-900 placeholder-gray-400"
                placeholder="e.g. Midterm Mathematics"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={examDetails.description}
                onChange={handleExamDetailsChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-none text-gray-900 placeholder-gray-400"
                placeholder="Provide details about this exam..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (in minutes)
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                value={examDetails.duration}
                onChange={handleExamDetailsChange}
                className="w-full md:w-1/3 px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-gray-900"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-8 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? 'Continuing...' : 'Continue to Questions'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded">
                  Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-gray-900 font-medium placeholder-gray-400"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="relative">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                          className="w-5 h-5 text-green-600 dark:text-green-500 focus:ring-green-500 border-gray-300 mr-3 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${q.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} text-gray-900 placeholder-gray-400`}
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Negative Marking</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={q.negativeMarks}
                      onChange={(e) => handleQuestionChange(qIndex, 'negativeMarks', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded outline-none text-gray-900 dark:text-white text-orange-600 dark:text-orange-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 py-3 px-6 bg-gray-50 hover:bg-gray-100 text-primary-500 font-medium rounded-xl transition-colors border border-dashed border-primary-200"
            >
              <Plus size={20} />
              Add Another Question
            </button>
            <button
              onClick={handleSaveQuestions}
              disabled={loading}
              className="flex items-center gap-2 py-3 px-8 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 disabled:opacity-70"
            >
              <Save size={20} />
              {loading ? 'Saving Exam...' : 'Publish Exam'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-12 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <CheckCircle size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Exam Created Successfully!</h2>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            Your exam '{examDetails.title}' is now live for students.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="py-3 px-6 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate(`/dashboard?view=analytics&examId=${examId}`)}
              className="py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              View Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
