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

type View = 'home' | 'batch' | 'test' | 'result' | 'dashboard' | 'admin' | 'public-result';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestSeries | null>(null);
  const [resultId, setResultId] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggle={() => setAuthMode('signup')} />
    ) : (
      <SignUp onToggle={() => setAuthMode('login')} />
    );
  }

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
          {currentView === 'home' && <BatchList onBatchClick={handleBatchClick} />}
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
