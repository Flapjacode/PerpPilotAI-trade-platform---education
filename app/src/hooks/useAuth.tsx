import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { User, LoginCredentials, SignupCredentials } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  connectSolanaWallet: (address: string) => void;
  connectEVMWallet: (address: string) => void;
  disconnectSolanaWallet: () => void;
  disconnectEVMWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'cryptoai_users';
const CURRENT_USER_KEY = 'cryptoai_current_user';
const SESSION_USER_KEY = 'cryptoai_session_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(SESSION_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): Record<string, User & { password: string }> => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveUsers = (users: Record<string, User & { password: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    const foundUser = Object.values(users).find(u => u.email === credentials.email);
    
    if (foundUser && foundUser.password === credentials.password) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);

      if (credentials.remember) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        sessionStorage.removeItem(SESSION_USER_KEY);
      } else {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(userWithoutPassword));
        localStorage.removeItem(CURRENT_USER_KEY);
      }

      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    
    if (Object.values(users).some(u => u.email === credentials.email)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      createdAt: new Date().toISOString(),
      wallets: {},
    };
    
    users[newUser.id] = newUser;
    saveUsers(users);
    
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  }, []);

  const connectSolanaWallet = useCallback((address: string) => {
    if (user) {
      const updatedUser = { ...user, wallets: { ...user.wallets, solana: address } };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      const users = getUsers();
      if (users[user.id]) {
        users[user.id].wallets.solana = address;
        saveUsers(users);
      }
    }
  }, [user]);

  const connectEVMWallet = useCallback((address: string) => {
    if (user) {
      const updatedUser = { ...user, wallets: { ...user.wallets, evm: address } };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      const users = getUsers();
      if (users[user.id]) {
        users[user.id].wallets.evm = address;
        saveUsers(users);
      }
    }
  }, [user]);

  const disconnectSolanaWallet = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, wallets: { ...user.wallets, solana: undefined } };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      const users = getUsers();
      if (users[user.id]) {
        delete users[user.id].wallets.solana;
        saveUsers(users);
      }
    }
  }, [user]);

  const disconnectEVMWallet = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, wallets: { ...user.wallets, evm: undefined } };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      const users = getUsers();
      if (users[user.id]) {
        delete users[user.id].wallets.evm;
        saveUsers(users);
      }
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    connectSolanaWallet,
    connectEVMWallet,
    disconnectSolanaWallet,
    disconnectEVMWallet,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
