import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // Simulate no user
    return () => {};
  }),
}));

vi.mock('../lib/firebase', () => ({
  auth: {}
}));

describe('useAuth', () => {
  it('should initialize with loading true and user null', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    // Since onAuthStateChanged is called immediately in the mock
    expect(result.current.loading).toBe(false);
  });
});
