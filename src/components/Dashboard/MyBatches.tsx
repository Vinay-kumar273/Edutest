import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrollments, getBatch } from '../../services/firestore';
import { Batch } from '../../types';
import { BookOpen, Loader2 } from 'lucide-react';

interface MyBatchesProps {
  onBatchClick: (batch: Batch) => void;
}

export const MyBatches = ({ onBatchClick }: MyBatchesProps) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledBatches = async () => {
      if (!user) return;

      try {
        const enrollments = await getUserEnrollments(user.uid);
        const batchPromises = enrollments.map(enrollment => getBatch(enrollment.batchId));
        const batchesData = await Promise.all(batchPromises);
        const validBatches = batchesData.filter(batch => batch !== null) as Batch[];
        setBatches(validBatches);
      } catch (error) {
        console.error('Error fetching enrolled batches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledBatches();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No batches enrolled yet</p>
        <p className="text-gray-400">Browse and enroll in batches to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {batches.map((batch) => (
        <div
          key={batch.id}
          onClick={() => onBatchClick(batch)}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
        >
          <div className="relative h-40 overflow-hidden">
            <img
              src={batch.thumbnail}
              alt={batch.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{batch.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{batch.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  batch.type === 'Free'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {batch.type}
              </span>
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                View Tests →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
