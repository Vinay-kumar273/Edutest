import { useEffect, useState } from 'react';
import { Batch } from '../../types';
import { getBatches, enrollInBatch, isEnrolledInBatch, checkPaidAccess } from '../../services/firestore';
import { BatchCard } from './BatchCard';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BatchListProps {
  onBatchClick: (batch: Batch) => void;
}

export const BatchList = ({ onBatchClick }: BatchListProps) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrolledBatches, setEnrolledBatches] = useState<Set<string>>(new Set());
  const [paidAccessBatches, setPaidAccessBatches] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingBatchId, setEnrollingBatchId] = useState<string | null>(null);

  const fetchBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data);

      if (user) {
        const checks = await Promise.all(
          data.map(async (batch) => ({
            batchId: batch.id,
            enrolled: await isEnrolledInBatch(user.uid, batch.id),
            hasPaidAccess: batch.type === 'Free' ? true : await checkPaidAccess(user.uid, batch.id)
          }))
        );

        const enrolled = new Set(
          checks.filter(c => c.enrolled).map(c => c.batchId)
        );
        setEnrolledBatches(enrolled);

        const paidAccess = new Set(
          checks.filter(c => c.hasPaidAccess).map(c => c.batchId)
        );
        setPaidAccessBatches(paidAccess);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [user]);

  const handleEnroll = async (batchId: string) => {
    if (!user) {
      alert('Please login to enroll in a batch.');
      return;
    }

    setEnrollingBatchId(batchId);
    try {
      console.log('Starting enrollment for user:', user.uid, 'batch:', batchId);
      await enrollInBatch(user.uid, batchId);
      setEnrolledBatches(prev => new Set(prev).add(batchId));
      alert('Successfully enrolled in batch!');
    } catch (error: any) {
      console.error('Error enrolling in batch:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to enroll in batch: ${errorMessage}\n\nPlease ensure Firestore rules are deployed in your Firebase Console.`);
    } finally {
      setEnrollingBatchId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No batches available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          isEnrolled={enrolledBatches.has(batch.id)}
          hasPaidAccess={paidAccessBatches.has(batch.id)}
          isEnrolling={enrollingBatchId === batch.id}
          onEnroll={() => handleEnroll(batch.id)}
          onClick={() => onBatchClick(batch)}
        />
      ))}
    </div>
  );
};
