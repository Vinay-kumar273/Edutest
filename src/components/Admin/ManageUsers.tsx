import { useState, useEffect } from 'react';
import { getBatches, grantPaidAccess } from '../../services/firestore';
import { Batch } from '../../types';
import { UserPlus, Loader2 } from 'lucide-react';

export const ManageUsers = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const data = await getBatches();
      setBatches(data.filter(b => b.type === 'Paid'));
    };
    fetchBatches();
  }, []);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const expiresAt = expiryDays
        ? Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000
        : undefined;

      await grantPaidAccess(userId, selectedBatch, expiresAt);

      setSuccess(true);
      setUserEmail('');
      setUserId('');
      setExpiryDays('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage User Access</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 text-sm">
          <strong>Note:</strong> To find a user's ID, they need to be registered first. You can view user IDs in the Firebase Console under Authentication.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Access granted successfully!
        </div>
      )}

      <form onSubmit={handleGrantAccess} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Paid Batch
          </label>
          <select
            required
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Choose a batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Email (for reference)
          </label>
          <input
            type="email"
            required
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID (Firebase UID)
          </label>
          <input
            type="text"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Firebase User ID"
          />
          <p className="text-sm text-gray-600 mt-2">
            Find this in Firebase Console → Authentication
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Duration (days)
          </label>
          <input
            type="number"
            min="1"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Leave empty for lifetime access"
          />
          <p className="text-sm text-gray-600 mt-2">
            Leave empty for lifetime access
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
          {loading ? 'Granting Access...' : 'Grant Access'}
        </button>
      </form>
    </div>
  );
};
