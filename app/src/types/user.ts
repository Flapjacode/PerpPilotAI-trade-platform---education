export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  wallets: {
    solana?: string;
    evm?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
