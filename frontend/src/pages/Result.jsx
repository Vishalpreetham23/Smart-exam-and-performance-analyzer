import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ChartComponent from '../components/ChartComponent';
import { Award, CheckCircle, XCircle, Clock, Home, TrendingUp } from 'lucide-react';

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Need to refetch user's specific submission with questions
        const res = await api.get(`/submissions/my`);
        const currentSub = res.data.find(sub => sub._id === id);
        
        if (currentSub) {
           // Fetch original exam to show what questions were right/wrong
           const examRes = await api.get(`/exams/${currentSub.examId._id}`);
           setResult({ ...currentSub, examDetails: examRes.data });
        } else {
           setError('Result not found or unauthorized.');
        }
      } catch (err) {
        setError('Failed to fetch result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  if (error) return <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-premium text-center text-orange-500">{error}</div>;

  if (!result) return <div>No result data.</div>;

  const { score, totalMarks, percentage, passed, timeTaken, examDetails, answers } = result;
  
  // Calculate correct/incorrect counts
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  answers.forEach(ans => {
    const question = examDetails.questions.find(q => q._id === ans.questionId);
    if (!question) return;
    
    // In actual implementation, student GET /exam/:id doesn't return correctAnswer.
    // If we want detailed review, we need an endpoint /submissions/:id/review or simply show overall stats.
    // Since our AttemptExam fetched without correct answers, we'll just show the high level stats for now.
    // Wait, the Schema Submission stores score, totalMarks, etc.
  });

  // We can just rely on the overall counts if we can't do individual mapping easily on frontend.
  // Actually, we can just display the overall stats perfectly.

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
        <button
           onClick={() => navigate('/dashboard')}
           className="p-2 text-gray-700 hover:text-gray-900 bg-white rounded-full shadow-premium border border-gray-100 transition"
        >
          <Home size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <div className={`col-span-1 md:col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-premium relative overflow-hidden text-white
          ${passed ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-orange-400 to-orange-500'}`}
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          
          <div className="mb-4 bg-white/20 p-4 rounded-full backdrop-blur-sm">
            {passed ? <Award size={64} className="text-white" /> : <XCircle size={64} className="text-white" />}
          </div>
          
          <h2 className="text-2xl font-bold mb-2 opacity-90">{passed ? 'Congratulations, You Passed!' : 'Unfortunately, You Failed.'}</h2>
          <div className="text-6xl font-extrabold mb-4 tracking-tight drop-shadow-sm">
            {percentage.toFixed(1)}<span className="text-4xl opacity-80">%</span>
          </div>
          
          <p className="text-lg opacity-90 font-medium">
            You scored {score} out of {totalMarks} points
          </p>
        </div>

        {/* Stats Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100 flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
               <Clock size={24} />
             </div>
             <p className="text-sm text-gray-700 font-medium uppercase tracking-wider mb-1">Time Taken</p>
             <p className="text-2xl font-bold text-gray-800">{timeTaken} Mins</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100 flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
               <TrendingUp size={24} />
             </div>
             <p className="text-sm text-gray-700 font-medium uppercase tracking-wider mb-1">Status</p>
             <p className="text-2xl font-bold text-gray-800">{passed ? 'Qualified' : 'Requires Review'}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Indicator</h3>
           <ChartComponent 
              type="pie" 
              data={{
                  labels: ['Score Achieved', 'Points Lost'],
                  datasets: [{
                    data: [score, totalMarks - score],
                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(209, 213, 219, 0.5)'],
                    borderColor: ['#3b82f6', '#d1d5db'],
                    borderWidth: 1,
                  }]
                }}
            />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Recommendations</h3>
            {passed ? (
               <div className="max-w-xs space-y-4">
                 <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                   Great job! Maintain your study habits.
                 </div>
                 <Link to="/dashboard" className="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg">Return to Dashboard</Link>
               </div>
            ) : (
               <div className="max-w-xs space-y-4 text-left">
                 <ul className="space-y-2 mb-6">
                   <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div> Review the core concepts.</li>
                   <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div> Practice time management.</li>
                   <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div> Analyze weak subjects.</li>
                 </ul>
                 <Link to="/dashboard" className="block w-full py-3 px-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium rounded-xl transition-colors">Return to Dashboard</Link>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Result;
