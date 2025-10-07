import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebaseService';

// Define o tipo para o valor do contexto
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props para o AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Componente Provedor que envolve a aplicação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged retorna uma função para desinscrever (unsubscribe)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log('Auth state changed. Current user:', user ? user.uid : null);
    });

    // Cleanup: desinscreve do listener quando o componente desmontar
    return () => {
      console.log('Unsubscribing from auth state changes.');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // Não renderiza os filhos até que o estado de autenticação seja determinado
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
