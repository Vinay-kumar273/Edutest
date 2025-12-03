import { useEffect, useState } from 'react';
import { TestAttempt, TestSeries } from '../../types';
import { getTestAttempt, getTestSeries } from '../../services/firestore';
import { Award, Clock, CheckCircle, XCircle, MinusCircle, Loader2 } from 'lucide-react';

interface PublicResultProps {
  attemptId: string;
}

export const PublicResult = ({ attemptId }: PublicResultProps) => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptData = await getTestAttempt(attemptId);
        if (attemptData) {
          setAttempt(attemptData);
          const testData = await getTestSeries(attemptData.testSeriesId);
          setTestSeries(testData);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!attempt || !testSeries) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Result not found</p>
      </div>
    );
  }

  const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`p-8 text-center ${
            parseFloat(percentage) >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
            parseFloat(percentage) >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
            parseFloat(percentage) >= 35 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <Award className="w-10 h-10 text-gray-800" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{attempt.userName}'s Result</h1>
            <p className="text-white text-lg opacity-90">{attempt.testName}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <p className="text-blue-800 font-semibold mb-2">Score</p>
                <p className="text-4xl font-bold text-blue-900">
                  {attempt.score}/{attempt.totalMarks}
                </p>
                <p className="text-blue-700 mt-2">{percentage}%</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <p className="text-gray-700 font-semibold mb-2">Time Taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-green-800 font-semibold">Correct</p>
                </div>
                <p className="text-3xl font-bold text-green-900">{attempt.correctAnswers}</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-800 font-semibold">Wrong</p>
                </div>
                <p className="text-3xl font-bold text-red-900">{attempt.wrongAnswers}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <MinusCircle className="w-6 h-6 text-gray-600" />
                  <p className="text-gray-800 font-semibold">Unanswered</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{attempt.unanswered}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Powered by <span className="font-semibold">EduTest Pro</span>
          </p>
        </div>
      </div>
    </div>
  );
};
