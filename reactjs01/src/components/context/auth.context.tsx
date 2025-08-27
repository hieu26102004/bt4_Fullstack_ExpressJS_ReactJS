import { createContext, useState } from 'react';

interface Auth {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
    id: string;
  };
}

interface AuthContextType {
  auth: Auth;
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
  appLoading: boolean;
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthWrapper = (props: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      email: "",
      name: "",
      id: ""
    }
  });

  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider value={{
      auth,
      setAuth,
      appLoading,
      setAppLoading,
    }}>
      {props.children}
    </AuthContext.Provider>
  );
};