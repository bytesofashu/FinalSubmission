import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { auth, loginWithGoogle, logout, db, OperationType, handleFirestoreError } from './lib/firebase';
import { getHeartPrediction, HealthData, HeartPrediction } from './lib/gemini';
import HeartMap from './components/Map';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Shield, 
  AlertCircle, 
  MapPin, 
  LogOut, 
  User as UserIcon, 
  ChevronRight, 
  Loader2, 
  Plus, 
  History,
  Info,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [prediction, setPrediction] = useState<HeartPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Health Data from Firestore
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setHealthData(snapshot.data() as HealthData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Latest Prediction
  useEffect(() => {
    if (!user) return;

    const predictionsRef = collection(db, 'users', user.uid, 'predictions');
    const q = query(predictionsRef, orderBy('createdAt', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPrediction(snapshot.docs[0].data() as HeartPrediction);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/predictions`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveHealthData = async (e: React.FormEvent<HTMLFormElement>) => {
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
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString()
      });
      setShowForm(false);
      generatePrediction(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const generatePrediction = async (data: HealthData) => {
    if (!user) return;
    setIsPredicting(true);
    try {
      const result = await getHeartPrediction(data);
      await addDoc(collection(db, 'users', user.uid, 'predictions'), {
        ...result,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {!user ? (
          <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Side: Hero */}
            <div className="flex-1 bg-red-600 p-12 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-700 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-xl"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Heart className="w-8 h-8 fill-white" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">HeartTwin</h1>
                </div>
                
                <h2 className="text-6xl font-bold leading-[1.1] mb-8 tracking-tight">
                  Your heart's <span className="text-red-200">digital twin</span> for a longer life.
                </h2>
                
                <p className="text-xl text-red-100 mb-12 leading-relaxed">
                  Predict heart health timelines, get personalized warnings, and find the best care near you using advanced AI and Google Cloud.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Activity, text: "Real-time health monitoring" },
                    { icon: Shield, text: "Secure medical data profile" },
                    { icon: MapPin, text: "Find top cardiologists nearby" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side: Login */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
              >
                <h3 className="text-3xl font-bold mb-4">Welcome Back</h3>
                <p className="text-gray-500 mb-12">Sign in to access your digital heart twin and health predictions.</p>
                
                <button 
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-semibold hover:bg-gray-50 transition-all group"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="mt-8 text-sm text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">HeartTwin</h1>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} />
                    ) : (
                      <UserIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{user.displayName}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Profile & Prediction */}
              <div className="lg:col-span-2 space-y-8">
                {/* Health Profile Card */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Activity className="w-24 h-24 text-red-500/5 -rotate-12" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Health Profile</h2>
                      <p className="text-gray-500">Your current physiological data</p>
                    </div>
                    <button 
                      onClick={() => setShowForm(!showForm)}
                      className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      {healthData ? <History className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {healthData ? "Update Data" : "Add Data"}
                    </button>
                  </div>

                  {healthData && !showForm ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: "Age", value: `${healthData.age} yrs` },
                        { label: "Weight", value: `${healthData.weight} kg` },
                        { label: "Height", value: `${healthData.height} cm` },
                        { label: "BP", value: healthData.bloodPressure },
                        { label: "Cholesterol", value: `${healthData.cholesterol} mg/dL` },
                        { label: "Smoking", value: healthData.smoking ? "Yes" : "No" },
                        { label: "Exercise", value: healthData.exercise },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                          <p className="text-lg font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {(showForm || !healthData) && (
                        <motion.form 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleSaveHealthData}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Age</label>
                              <input required name="age" type="number" defaultValue={healthData?.age} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                              <input required name="weight" type="number" defaultValue={healthData?.weight} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                              <input required name="height" type="number" defaultValue={healthData?.height} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Blood Pressure (e.g. 120/80)</label>
                              <input required name="bloodPressure" type="text" defaultValue={healthData?.bloodPressure} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Cholesterol (mg/dL)</label>
                              <input required name="cholesterol" type="number" defaultValue={healthData?.cholesterol} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Exercise Frequency</label>
                              <select name="exercise" defaultValue={healthData?.exercise} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                                <option>Sedentary</option>
                                <option>Light (1-2 days/week)</option>
                                <option>Moderate (3-4 days/week)</option>
                                <option>Active (5+ days/week)</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input name="smoking" type="checkbox" defaultChecked={healthData?.smoking} className="w-5 h-5 accent-red-600" />
                            <label className="text-sm font-medium text-gray-700">I am a smoker</label>
                          </div>
                          <div className="flex gap-4">
                            <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                              Save & Generate Twin
                            </button>
                            {healthData && (
                              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Cancel
                              </button>
                            )}
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  )}
                </section>

                {/* Prediction Card */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                        <Activity className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-bold">Twin Prediction</h2>
                    </div>
                    {isPredicting && (
                      <div className="flex items-center gap-2 text-indigo-600 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI is thinking...
                      </div>
                    )}
                  </div>

                  {prediction ? (
                    <div className="space-y-8">
                      <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3 uppercase tracking-wider text-xs">
                          <History className="w-4 h-4" />
                          Health Timeline
                        </div>
                        <p className="text-lg leading-relaxed text-indigo-900">{prediction.timeline}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                          <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 uppercase tracking-wider text-xs">
                            <AlertCircle className="w-4 h-4" />
                            Risk Warnings
                          </div>
                          <p className="text-amber-900">{prediction.warning}</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3 uppercase tracking-wider text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            Recommendations
                          </div>
                          <div className="text-emerald-900 prose prose-sm max-w-none">
                            <ReactMarkdown>{prediction.recommendations}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Complete your health profile to generate your digital twin prediction.</p>
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Map & Tools */}
              <div className="space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold">Nearby Care</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Find top-rated cardiologists and heart specialists in your area.</p>
                  <HeartMap />
                </section>

                <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl text-white">
                  <h3 className="text-xl font-bold mb-4">Secure & Private</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Your medical data is encrypted and stored securely on Google Cloud. Only you have access to your digital heart twin.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    HIPAA Compliant Infrastructure
                  </div>
                </section>
              </div>
            </main>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
