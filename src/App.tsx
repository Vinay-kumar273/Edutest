import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { Navbar } from './components/Layout/Navbar';
import { BatchList } from './components/Batches/BatchList';
import { BatchDetail } from './components/Batches/BatchDetail';
import { TestInterface } from './components/Test/TestInterface';
import { TestResult } from './components/Test/TestResult';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PublicResult } from './components/Shared/PublicResult';
import { Batch, TestSeries } from './types';
import { Loader2 } from 'lucide-react';

type View =
  | 'verify'
  | 'home'
  | 'batch'
  | 'test'
  | 'result'
  | 'dashboard'
  | 'admin'
  | 'public-result';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<View>('verify');   // 👈 default verify first
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestSeries | null>(null);
  const [resultId, setResultId] = useState<string>('');

  // ========= LOADING ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ========= AUTH ==========
  if (!user) {
    return authMode === 'login' ? (
      <Login onToggle={() => setAuthMode('signup')} />
    ) : (
      <SignUp onToggle={() => setAuthMode('login')} />
    );
  }

  // ========= VERIFICATION PAGE ==========
  if (currentView === 'verify') {
    return (
      <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gray-50 px-4">
        <h1 className="text-2xl font-bold">Verification Required</h1>
        <p className="max-w-md text-center text-gray-600">
          Please complete the verification step to access tests and dashboard.
          This helps us keep the platform free for everyone.
        </p>

        <a
          href="YOUR_SHORTENER_LINK_HERE"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow"
        >
          Verify & Continue
        </a>

        <button
          onClick={() => setCurrentView('home')}
          className="text-sm underline text-gray-600"
        >
          I have completed verification
        </button>
      </div>
    );
  }

  // ========= HANDLERS ==========
  const handleBatchClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setCurrentView('batch');
  };

  const handleStartTest = (testSeries: TestSeries) => {
    setSelectedTest(testSeries);
    setCurrentView('test');
  };

  const handleTestComplete = (attemptId: string) => {
    setResultId(attemptId);
    setCurrentView('result');
  };

  const handleBackFromBatch = () => {
    setSelectedBatch(null);
    setCurrentView('home');
  };

  const handleBackFromResult = () => {
    setSelectedTest(null);
    setCurrentView(selectedBatch ? 'batch' : 'home');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    if (view === 'home') {
      setSelectedBatch(null);
      setSelectedTest(null);
    }
  };

  const handleViewResultFromDashboard = (attemptId: string) => {
    setResultId(attemptId);
    setCurrentView('result');
  };

  // ========= CONTENT RENDER ==========
  const renderContent = () => {
    if (currentView === 'test' && selectedTest) {
      const batchId = selectedBatch?.id || selectedTest.batchId;
      return (
        <TestInterface
          testSeries={selectedTest}
          batchId={batchId}
          onComplete={handleTestComplete}
          onExit={() => {
            setSelectedTest(null);
            setCurrentView(selectedBatch ? 'batch' : 'dashboard');
          }}
        />
      );
    }

    if (currentView === 'result' && resultId) {
      return (
        <TestResult
          attemptId={resultId}
          onBack={handleBackFromResult}
          onReattempt={(testSeries) => {
            setSelectedTest(testSeries);
            setCurrentView('test');
          }}
        />
      );
    }

    if (currentView === 'public-result' && resultId) {
      return <PublicResult attemptId={resultId} />;
    }

    return (
      <>
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {currentView === 'home' && (
            <BatchList onBatchClick={handleBatchClick} />
          )}
          {currentView === 'batch' && selectedBatch && (
            <BatchDetail
              batch={selectedBatch}
              onBack={handleBackFromBatch}
              onStartTest={handleStartTest}
            />
          )}
          {currentView === 'dashboard' && (
            <StudentDashboard
              onViewResult={handleViewResultFromDashboard}
              onBatchClick={handleBatchClick}
            />
          )}
          {currentView === 'admin' && <AdminPanel />}
        </div>
      </>
    );
  };

  return <div className="min-h-screen bg-gray-50">{renderContent()}</div>;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
