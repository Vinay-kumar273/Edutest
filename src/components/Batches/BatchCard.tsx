import { Batch } from '../../types';
import { Lock, Unlock, Check, Loader2, Eye } from 'lucide-react';

interface BatchCardProps {
  batch: Batch;
  isEnrolled: boolean;
  hasPaidAccess: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  onClick: () => void;
}

export const BatchCard = ({ batch, isEnrolled, hasPaidAccess, isEnrolling, onEnroll, onClick }: BatchCardProps) => {
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll();
  };

  const canEnroll = batch.type === 'Free' || hasPaidAccess;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={onClick}>
        <img
          src={batch.thumbnail}
          alt={batch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
              batch.type === 'Free'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {batch.type === 'Free' ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {batch.type}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="cursor-pointer mb-4" onClick={onClick}>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{batch.name}</h3>
          <p className="text-gray-600 line-clamp-2">{batch.description}</p>
        </div>

        {isEnrolled ? (
          <button
            onClick={onClick}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <Check className="w-5 h-5" />
            Enrolled - View Batch
          </button>
        ) : canEnroll ? (
          <button
            onClick={handleEnrollClick}
            disabled={isEnrolling}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enrolling...
              </>
            ) : (
              'Enroll Now'
            )}
          </button>
        ) : (
          <button
            onClick={onClick}
            className="w-full bg-amber-100 text-amber-800 py-2 px-4 rounded-lg font-semibold hover:bg-amber-200 transition flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            View Details - Access Required
          </button>
        )}
      </div>
    </div>
  );
};
