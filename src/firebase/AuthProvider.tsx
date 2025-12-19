'use client';
import React, { useState, useEffect, useContext, createContext } from 'react';
import { auth } from './firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isTeacher: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ↓ この export が重要です
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth error');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdTokenResult();
        setIsTeacher(token.claims.role === 'teacher');
      } else {
        setIsTeacher(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout, isTeacher }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

