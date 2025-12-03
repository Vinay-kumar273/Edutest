import { useState, useEffect } from 'react';
import { Mail, Trash2, Plus, Loader2 } from 'lucide-react';
import { getCoAdmins, addCoAdmin, removeCoAdmin } from '../../services/firestore';
import { CoAdmin } from '../../types';

export const ManageCoAdmins = () => {
  const [coAdmins, setCoAdmins] = useState<CoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCoAdmins();
  }, []);

  const fetchCoAdmins = async () => {
    try {
      const data = await getCoAdmins();
      setCoAdmins(data);
    } catch (error) {
      console.error('Error fetching co-admins:', error);
      alert('Failed to load co-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !email || !name) {
      alert('Please fill all fields');
      return;
    }

    setAdding(true);
    try {
      await addCoAdmin({ userId, email, name });
      setSuccess(true);
      setUserId('');
      setEmail('');
      setName('');
      await fetchCoAdmins();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding co-admin:', error);
      alert('Failed to add co-admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCoAdmin = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" as co-admin?`)) {
      return;
    }

    setRemoving(id);
    try {
      await removeCoAdmin(id);
      await fetchCoAdmins();
      alert('Co-admin removed successfully');
    } catch (error) {
      console.error('Error removing co-admin:', error);
      alert('Failed to remove co-admin');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Co-Admins</h2>
      <p className="text-gray-600 mb-6">Co-admins can upload tests and study materials but cannot delete them</p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Co-admin added successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Co-Admin</h3>

          <form onSubmit={handleAddCoAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Firebase User ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">Find in Firebase Console → Authentication</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Co-admin name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Co-Admin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Co-Admins</h3>
          <p className="text-sm text-gray-600 mb-4">{coAdmins.length} co-admin(s)</p>

          {coAdmins.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No co-admins added yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {coAdmins.map((coAdmin) => (
                <div key={coAdmin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{coAdmin.name}</p>
                      <p className="text-sm text-gray-600 truncate">{coAdmin.email}</p>
                      <p className="text-xs text-gray-500">{coAdmin.userId}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCoAdmin(coAdmin.id, coAdmin.name)}
                    disabled={removing === coAdmin.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                    title="Remove co-admin"
                  >
                    {removing === coAdmin.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Co-Admin Permissions</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><span className="font-medium">Can:</span> Upload tests, upload study materials, create and edit batches</p>
          <p><span className="font-medium">Cannot:</span> Delete batches, tests, or study materials (only full admin can)</p>
          <p><span className="font-medium">Note:</span> Users must be registered in Firebase first</p>
        </div>
      </div>
    </div>
  );
};
