import { createContext, useContext, createSignal, JSX } from "solid-js";
import { createStore } from "solid-js/store";

// 1. Define the Shape of the State
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// 2. Create the Context (Keep Private/Unexported)
const AuthContext = createContext<{
  state: AuthState;
  login: (user: User) => void;
  logout: () => void;
}>();

// 3. The Encapsulated Provider Component
export function AuthProvider(props: { children: JSX.Element }) {
  // Initialize state inside the provider for proper reactive scope
  const [state, setState] = createStore<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
  });

  const login = (user: User) => {
    setState({ user, isAuthenticated: true });
  };

  const logout = () => {
    setState({ user: null, isAuthenticated: false });
  };

  const value = {
    state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}

// 4. The Type-Safe Custom Hook (The only way to consume)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
