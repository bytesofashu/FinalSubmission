import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { analytics } from '../lib/analytics';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        analytics.logEvent('login', { method: 'google' });
        analytics.setUserProperties({ 
          email: currentUser.email,
          uid: currentUser.uid 
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
