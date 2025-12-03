import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TestAttempt } from '../../types';
import { Loader2, TrendingUp } from 'lucide-react';

export const ViewResults = () => {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const q = query(collection(db, 'attempts'), orderBy('completedAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
        setAttempts(data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'all') return true;
    const percentage = (attempt.score / attempt.totalMarks) * 100;
    if (filter === 'high') return percentage >= 75;
    if (filter === 'medium') return percentage >= 50 && percentage < 75;
    if (filter === 'low') return percentage < 50;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">All Results</option>
          <option value="high">High Performers (≥75%)</option>
          <option value="medium">Medium Performers (50-74%)</option>
          <option value="low">Needs Improvement (&lt;50%)</option>
        </select>
      </div>

      {filteredAttempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No results found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => {
            const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
            return (
              <div
                key={attempt.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{attempt.userName}</h3>
                        <p className="text-sm text-gray-600">{attempt.userEmail}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-gray-800">{attempt.testName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.completedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <p className="text-gray-600">Correct</p>
                        <p className="font-semibold text-green-600">{attempt.correctAnswers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Wrong</p>
                        <p className="font-semibold text-red-600">{attempt.wrongAnswers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Unanswered</p>
                        <p className="font-semibold text-gray-600">{attempt.unanswered}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time Taken</p>
                        <p className="font-semibold text-gray-900">
                          {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      parseFloat(percentage) >= 75 ? 'bg-green-100 text-green-800' :
                      parseFloat(percentage) >= 50 ? 'bg-blue-100 text-blue-800' :
                      parseFloat(percentage) >= 35 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold">{percentage}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {attempt.score}/{attempt.totalMarks} marks
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
