import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ExamCard from '../components/ExamCard';
import ChartComponent from '../components/ChartComponent';
import { PlusCircle, Loader2, ArrowLeft, TrendingUp, Users, Award, AlertTriangle, BookOpen, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'exams';
  const examId = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [view, examId, user.role]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (user.role === 'Student') {
        if (view === 'exams') {
          const res = await api.get('/exams');
          setExams(res.data);
        } else if (view === 'results') {
          const res = await api.get('/submissions/my');
          setSubmissions(res.data);
        }
      } else if (user.role === 'Teacher' || user.role === 'Admin') {
        if (view === 'exams') {
          const res = await api.get('/exams');
          // Fix: createdBy might be an object from populate or a string ID
          setExams(res.data.filter(e => {
            const creatorId = typeof e.createdBy === 'object' ? e.createdBy._id : e.createdBy;
            return user.role === 'Admin' || creatorId === user?._id;
          }));
        } else if (view === 'analytics' && examId) {
          const res = await api.get(`/analytics/exam/${examId}`);
          if (res.data.message) {
            setError(res.data.message);
            setAnalytics(null);
          } else {
            setAnalytics(res.data);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleExamAction = async (id, type) => {
    if (type === 'view') {
      navigate(`/dashboard?view=analytics&examId=${id}`);
    } else {
      navigate(`/exam/${id}`);
    }
  };

  const renderStudentView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setSearchParams({ view: 'exams' })}
          className={`px-4 py-3 font-medium text-sm transition-colors ${view === 'exams' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Available Exams
        </button>
        <button
          onClick={() => setSearchParams({ view: 'results' })}
          className={`px-4 py-3 font-medium text-sm transition-colors ${view === 'results' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Results
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
      ) : error ? (
        <div className="text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg flex items-center gap-2"><AlertTriangle size={20}/> {error}</div>
      ) : view === 'exams' ? (
        exams.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">No exams available currently.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <ExamCard key={exam._id} exam={exam} role="Student" onAction={handleExamAction} />
            ))}
          </div>
        )
      ) : (
        submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">You haven't attempted any exams yet.</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                    <th className="p-4 font-semibold">Exam Title</th>
                    <th className="p-4 font-semibold">Score</th>
                    <th className="p-4 font-semibold">Percentage</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-400">
                  {submissions.map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{sub.examId?.title || 'Deleted Exam'}</td>
                      <td className="p-4">{sub.score} / {sub.totalMarks}</td>
                      <td className="p-4">{sub.percentage.toFixed(1)}%</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${sub.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {sub.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link to={`/result/${sub._id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium text-sm hover:underline">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );

  const renderTeacherView = () => (
    <div className="space-y-6 animate-fade-in">
      {view === 'exams' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Exams</h2>
            <Link
              to="/create-exam"
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-premium font-medium text-sm"
            >
              <PlusCircle size={20} />
              Create New Exam
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : error ? (
            <div className="text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg flex items-center gap-2"><AlertTriangle size={20}/> {error}</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
               <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-lg font-medium">You haven't created any exams yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map(exam => (
                <ExamCard key={exam._id} exam={exam} role="Teacher" onAction={(id) => navigate(`/dashboard?view=analytics&examId=${id}`)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="animate-fade-in">
          <button
            onClick={() => setSearchParams({ view: 'exams' })}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Exams
          </button>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Exam Analytics Dashboard</h2>
          
          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : error ? (
            <div className="text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg flex items-center gap-2"><AlertTriangle size={20}/> {error}</div>
          ) : analytics ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                  <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg mr-4"><Users size={24}/></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalStudentsAttempted}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                  <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg mr-4"><TrendingUp size={24}/></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.passPercentage.toFixed(1)}%</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                  <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg mr-4"><BarChart2 size={24}/></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Avg Score</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageScore.toFixed(1)}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                   <div className="p-3 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg mr-4"><Award size={24}/></div>
                   <div><p className="text-sm text-gray-500 dark:text-gray-400">Highest Score</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.highestScore}</p></div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartComponent 
                  type="pie" 
                  title="Pass vs Fail Ratio"
                  data={{
                    labels: ['Passed', 'Failed'],
                    datasets: [{
                      data: [analytics.passCount, analytics.totalStudentsAttempted - analytics.passCount],
                      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                      borderColor: ['#22c55e', '#ef4444'],
                      borderWidth: 1,
                    }]
                  }}
                />
                
                {/* Leaderboard */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 sm:h-80 overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Award className="text-yellow-500" size={20}/> Top Performers
                  </h3>
                  <div className="space-y-4">
                    {analytics.leaderboard.map((sub, idx) => (
                      <div key={sub._id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{sub.studentId.name}</p>
                            <p className="text-xs text-gray-500">{sub.percentage.toFixed(1)}% • {sub.timeTaken} mins</p>
                          </div>
                        </div>
                        <span className="font-mono font-medium text-primary-600 dark:text-primary-400">{sub.score} <span className="text-xs text-gray-400">pts</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hello, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome to your {user?.role.toLowerCase()} dashboard.
        </p>
      </div>

      {user?.role === 'Student' ? renderStudentView() : renderTeacherView()}
    </div>
  );
};

export default Dashboard;
