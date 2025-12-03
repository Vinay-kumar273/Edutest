import { useState } from 'react';
import { Plus, Upload, Users, BarChart3, FolderEdit, FileEdit, BookOpen, Settings } from 'lucide-react';
import { CreateBatch } from './CreateBatch';
import { UploadTest } from './UploadTest';
import { ManageUsers } from './ManageUsers';
import { ViewResults } from './ViewResults';
import { ManageBatches } from './ManageBatches';
import { ManageTests } from './ManageTests';
import { UploadStudyMaterial } from './UploadStudyMaterial';
import { ManageStudyMaterials } from './ManageStudyMaterials';
import { ManageCoAdmins } from './ManageCoAdmins';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'batches' | 'tests' | 'users' | 'results' | 'manage-batches' | 'manage-tests' | 'upload-materials' | 'manage-materials' | 'coadmins';

export const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('batches');

  const baseTabs = [
    { id: 'batches' as TabType, label: 'Create Batch', icon: Plus },
    { id: 'manage-batches' as TabType, label: 'Manage Batches', icon: FolderEdit },
    { id: 'tests' as TabType, label: 'Upload Test', icon: Upload },
    { id: 'manage-tests' as TabType, label: 'Manage Tests', icon: FileEdit },
    { id: 'upload-materials' as TabType, label: 'Upload Material', icon: BookOpen },
    { id: 'manage-materials' as TabType, label: 'Manage Materials', icon: FileEdit },
    { id: 'users' as TabType, label: 'Manage Users', icon: Users },
    { id: 'results' as TabType, label: 'View Results', icon: BarChart3 }
  ];

  const adminTabs = isAdmin ? [{ id: 'coadmins' as TabType, label: 'Manage Co-Admins', icon: Settings }] : [];
  const tabs = [...baseTabs, ...adminTabs];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage batches, tests, and users</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'batches' && <CreateBatch />}
          {activeTab === 'manage-batches' && <ManageBatches />}
          {activeTab === 'tests' && <UploadTest />}
          {activeTab === 'manage-tests' && <ManageTests />}
          {activeTab === 'upload-materials' && <UploadStudyMaterial />}
          {activeTab === 'manage-materials' && <ManageStudyMaterials />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'results' && <ViewResults />}
          {activeTab === 'coadmins' && <ManageCoAdmins />}
        </div>
      </div>
    </div>
  );
};
