import React, { createContext, useContext, useState } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (phone, password) => {
    const found = mockUsers.find(u => u.phone === phone && u.password === password);
    if (found) {
      setUser(found);
      return found;
    }
    return null;
  };

  const register = (userData) => {
    const newUser = { ...userData, id: `user_${Date.now()}`, grandScore: 0 };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
