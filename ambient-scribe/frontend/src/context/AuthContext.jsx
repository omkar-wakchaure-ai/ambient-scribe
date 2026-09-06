import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock auth state: null, 'doctor', or 'patient'
  const [userRole, setUserRole] = useState(null); 

  const login = (role) => setUserRole(role);
  const logout = () => setUserRole(null);

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);