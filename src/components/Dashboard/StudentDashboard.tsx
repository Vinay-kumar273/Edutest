import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAttempts, getUserProgress, getBatches } from '../../services/firestore';
import { TestAttempt, UserProgress, Batch } from '../../types';
import { Award, TrendingUp, BookOpen, Clock, Loader2, Library } from 'lucide-react';
import { MyBatches } from './MyBatches';

interface StudentDashboardProps {
  onViewResult: (attemptId: string) => void;
  onBatchClick: (batch: Batch) => void;
}

export const StudentDashboard = ({ onViewResult, onBatchClick }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'my-batches'>('overview');
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [attemptsData, progressData, batchesData] = await Promise.all([
          getUserAttempts(user.uid),
          getUserProgress(user.uid),
          getBatches()
        ]);

        setAttempts(attemptsData);
        setProgress(progressData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalTests = attempts.length;
  const averageScore = totalTests > 0
    ? (attempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) / totalTests).toFixed(1)
    : 0;
  const totalTime = attempts.reduce((sum, a) => sum + a.timeTaken, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">Track your progress and performance</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-semibold flex items-center gap-2 transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('my-batches')}
            className={`pb-4 px-2 font-semibold flex items-center gap-2 transition ${
              activeTab === 'my-batches'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Library className="w-5 h-5" />
            My Batches
          </button>
        </div>
      </div>

      {activeTab === 'my-batches' ? (
        <MyBatches onBatchClick={onBatchClick} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">{totalTests}</p>
          <p className="text-blue-100">Tests Completed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">{averageScore}%</p>
          <p className="text-green-100">Average Score</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">{progress.length}</p>
          <p className="text-amber-100">Active Batches</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">{Math.floor(totalTime / 60)}m</p>
          <p className="text-purple-100">Time Spent</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Attempts</h2>

        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No test attempts yet. Start practicing now!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.slice(0, 10).map((attempt) => {
              const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
              return (
                <div
                  key={attempt.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => onViewResult(attempt.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{attempt.testName}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(attempt.completedAt).toLocaleString()}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-700">
                            {attempt.correctAnswers} Correct
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-gray-700">
                            {attempt.wrongAnswers} Wrong
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-gray-700">
                            {attempt.unanswered} Unanswered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        parseFloat(percentage) >= 75 ? 'text-green-600' :
                        parseFloat(percentage) >= 50 ? 'text-blue-600' :
                        parseFloat(percentage) >= 35 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {percentage}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {attempt.score}/{attempt.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Batch Progress</h2>

        {progress.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No progress yet. Enroll in a batch to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.map((prog) => {
              const batch = batches.find((b) => b.id === prog.batchId);
              if (!batch) return null;

              return (
                <div key={prog.batchId} className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{batch.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {prog.completedTests.length} test{prog.completedTests.length !== 1 ? 's' : ''} completed
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (prog.completedTests.length / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
