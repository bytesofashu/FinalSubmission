import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { HealthData, HeartPrediction } from '../lib/gemini';

export function useHealthData(user: User | null) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [prediction, setPrediction] = useState<HeartPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHealthData(null);
      setPrediction(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Sync Health Data
    const userDocRef = doc(db, 'users', user.uid);
    const unsubHealth = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setHealthData(snapshot.data() as HealthData);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });

    // Sync Latest Prediction
    const predictionsRef = collection(db, 'users', user.uid, 'predictions');
    const q = query(predictionsRef, orderBy('createdAt', 'desc'), limit(1));
    const unsubPrediction = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPrediction(snapshot.docs[0].data() as HeartPrediction);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/predictions`);
    });

    return () => {
      unsubHealth();
      unsubPrediction();
    };
  }, [user]);

  return { healthData, prediction, loading };
}
