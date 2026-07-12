import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage and set user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would decode the token or fetch user info
      // For now, we'll just set the user from the token payload (if JWT)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          _id: payload._id || payload.id,
          email: payload.email,
          name: payload.name,
        });
      } catch (e) {
        // If token is invalid, remove it
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};