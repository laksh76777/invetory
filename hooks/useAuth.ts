import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Pre-seed with a demo user
const seedDemoUser = () => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users['demo@example.com']) {
        users['demo@example.com'] = {
            id: 'user-1',
            email: 'demo@example.com',
            password: 'password123', // In a real app, this would be hashed
            name: 'Alex Doe',
            shopName: 'Alex\'s Corner Shop',
            shopLogo: `https://i.pravatar.cc/150?u=user-1`,
            shopAddress: '123 Market Street, Mumbai, Maharashtra, 400001',
            phoneNumber: '9876543210',
            gstNumber: '27ABCDE1234F1Z5',
            taxRate: 5, // 5%
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
};
seedDemoUser();


interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  signup: (details: Omit<User, 'id'> & {password: string}) => { success: boolean; error?: string };
  updateUser: (details: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const userJson = localStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  });

  const login = (email: string, pass: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[email];

    if (userData && userData.password === pass) {
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        shopName: userData.shopName,
        shopLogo: userData.shopLogo,
        shopAddress: userData.shopAddress,
        phoneNumber: userData.phoneNumber,
        gstNumber: userData.gstNumber,
        taxRate: userData.taxRate,
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const signup = (details: Omit<User, 'id'> & {password: string}) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[details.email]) {
        return { success: false, error: 'An account with this email already exists.' };
    }
    const newUserId = uuidv4();
    const newUserForDb = {
        id: newUserId,
        email: details.email,
        password: details.password, // Again, don't store plain text passwords in real apps!
        name: details.name,
        shopName: details.shopName,
        shopLogo: details.shopLogo,
        shopAddress: details.shopAddress,
        phoneNumber: details.phoneNumber,
        gstNumber: details.gstNumber,
        taxRate: details.taxRate,
    };
    users[details.email] = newUserForDb;
    localStorage.setItem('users', JSON.stringify(users));

    // Automatically log in the new user
    const userForState: User = {
      id: newUserId,
      email: details.email,
      name: details.name,
      shopName: details.shopName,
      shopLogo: details.shopLogo,
      shopAddress: details.shopAddress,
      phoneNumber: details.phoneNumber,
      gstNumber: details.gstNumber,
      taxRate: details.taxRate,
    };
    localStorage.setItem('currentUser', JSON.stringify(userForState));
    setCurrentUser(userForState);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  const updateUser = (details: Partial<User>) => {
    if (currentUser) {
        const updatedUser = { ...currentUser, ...details };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if(users[currentUser.email]) {
            // Ensure password isn't overwritten if not provided in details
            const password = users[currentUser.email].password;
            const updatedDetails = { ...users[currentUser.email], ...details, password };

            // Handle logo removal
            if ('shopLogo' in details && details.shopLogo === undefined) {
                delete updatedDetails.shopLogo;
            }

            users[currentUser.email] = updatedDetails;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
  };

  const value = { currentUser, login, logout, signup, updateUser };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};