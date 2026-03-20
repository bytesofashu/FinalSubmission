import React, { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { HealthProvider, useHealth } from './contexts/HealthContext';
import { AuthHero } from './components/AuthHero';
import { DashboardHeader } from './components/DashboardHeader';
import { HealthProfile } from './components/HealthProfile';
import { PredictionView } from './components/PredictionView';
import { CareSidebar } from './components/CareSidebar';
import { AlertCircle, Loader2 } from 'lucide-react';
import { HealthData } from './lib/gemini';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message?.startsWith('{') 
                ? "A database error occurred. Please check your permissions."
                : "An unexpected error occurred. Please refresh the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Dashboard() {
  const { user } = useAuth();
  const { healthData, prediction, isPredicting, saveHealthData } = useHealth();
  const [showForm, setShowForm] = useState(false);

  const handleSave = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const data: HealthData = {
      age: Number(formData.get('age')),
      weight: Number(formData.get('weight')),
      height: Number(formData.get('height')),
      bloodPressure: formData.get('bloodPressure') as string,
      cholesterol: Number(formData.get('cholesterol')),
      smoking: formData.get('smoking') === 'on',
      exercise: formData.get('exercise') as string,
    };

    try {
      await saveHealthData(user, data);
      setShowForm(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [user, saveHealthData]);

  if (!user) return <AuthHero />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DashboardHeader user={user} />
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HealthProfile 
            healthData={healthData} 
            showForm={showForm} 
            setShowForm={setShowForm} 
            onSave={handleSave} 
          />
          <PredictionView 
            prediction={prediction} 
            isPredicting={isPredicting} 
            hasHealthData={!!healthData} 
          />
        </div>
        <CareSidebar />
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HealthProvider user={user}>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Dashboard />
        </div>
      </HealthProvider>
    </ErrorBoundary>
  );
}
