import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { getHeartPrediction, HealthData, HeartPrediction } from '../lib/gemini';
import { useHealthData } from '../hooks/useHealthData';
import { analytics } from '../lib/analytics';

interface HealthContextType {
  healthData: HealthData | null;
  prediction: HeartPrediction | null;
  loading: boolean;
  isPredicting: boolean;
  saveHealthData: (user: User, data: HealthData) => Promise<void>;
  generatePrediction: (user: User, data: HealthData) => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children, user }: { children: React.ReactNode; user: User | null }) {
  const { healthData, prediction, loading } = useHealthData(user);
  const [isPredicting, setIsPredicting] = useState(false);

  const generatePrediction = useCallback(async (user: User, data: HealthData) => {
    setIsPredicting(true);
    analytics.logEvent('prediction_started', { uid: user.uid });
    try {
      const result = await getHeartPrediction(data);
      await addDoc(collection(db, 'users', user.uid, 'predictions'), {
        ...result,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      analytics.logEvent('prediction_success', { uid: user.uid });
    } catch (error) {
      console.error("Prediction failed:", error);
      analytics.logEvent('prediction_failed', { uid: user.uid, error: String(error) });
      throw error;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const saveHealthData = useCallback(async (user: User, data: HealthData) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString()
      });
      analytics.logEvent('health_data_saved', { uid: user.uid });
      await generatePrediction(user, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  }, [generatePrediction]);

  return (
    <HealthContext.Provider value={{ 
      healthData, 
      prediction, 
      loading, 
      isPredicting, 
      saveHealthData, 
      generatePrediction 
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
