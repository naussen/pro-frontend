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
  // Lógica de autenticação real comentada para fins de teste
  /*
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log('Auth state changed. Current user:', user ? user.uid : null);
    });

    return () => {
      console.log('Unsubscribing from auth state changes.');
      unsubscribe();
    };
  }, []);
  */

  // Simula um usuário logado para teste
  const value = {
    currentUser: { 
      uid: 'test-user-123', 
      email: 'test@example.com', 
      displayName: 'Usuário de Teste' 
      // Adicione outras propriedades do objeto User se necessário
    } as User,
    loading: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
