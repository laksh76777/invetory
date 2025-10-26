import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- Helper Functions for managing the user database in localStorage ---

// A more robust way to get all registered users.
const getUsersDatabase = (): Record<string, any> => {
    try {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : {};
    } catch (error) {
        console.error("Failed to parse users database from localStorage", error);
        return {}; // Return empty object on error to prevent crashes
    }
};

// A dedicated function to save the entire user database.
const saveUsersDatabase = (users: Record<string, any>) => {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error("Failed to save users database to localStorage", error);
    }
};


// --- Initial Seeding for Demo User ---

const seedDemoUser = () => {
    const users = getUsersDatabase();
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
        saveUsersDatabase(users);
    }
};
seedDemoUser();


// --- Auth Context and Provider ---

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string, rememberMe: boolean) => { success: boolean; error?: string };
  logout: () => void;
  signup: (details: Omit<User, 'id'> & {password: string}) => { success: boolean; error?: string };
  updateUser: (details: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // This logic correctly prioritizes a long-term session over a temporary one.
    try {
      const rememberedUserJson = localStorage.getItem('currentUser');
      if (rememberedUserJson) return JSON.parse(rememberedUserJson);
      
      const sessionUserJson = sessionStorage.getItem('currentUser');
      return sessionUserJson ? JSON.parse(sessionUserJson) : null;
    } catch (error) {
      console.error("Failed to load current user from storage", error);
      return null;
    }
  });

  const login = (email: string, pass: string, rememberMe: boolean) => {
    const users = getUsersDatabase();
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

      // Clear any previous session to prevent conflicts.
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');

      // Persist session based on "Remember Me" choice.
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const signup = (details: Omit<User, 'id'> & {password: string}) => {
    const users = getUsersDatabase();
    // Robust check for existing users.
    if (users[details.email]) {
        return { success: false, error: 'This email is already registered. Please log in instead.' };
    }
    
    const newUserId = uuidv4();
    const newUserForDb = {
        id: newUserId,
        email: details.email,
        password: details.password, // In a real app, this MUST be hashed!
        name: details.name,
        shopName: details.shopName,
        shopLogo: details.shopLogo,
        shopAddress: details.shopAddress,
        phoneNumber: details.phoneNumber,
        gstNumber: details.gstNumber,
        taxRate: details.taxRate,
    };
    users[details.email] = newUserForDb;
    saveUsersDatabase(users);

    // Automatically log in the new user (session only for new signups)
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
    sessionStorage.setItem('currentUser', JSON.stringify(userForState));
    setCurrentUser(userForState);

    return { success: true };
  };

  const logout = useCallback(() => {
    // Ensure logout clears both session types and state.
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
  }, []);
  
  const updateUser = (details: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...details };
    setCurrentUser(updatedUser);

    // Persist the updated user session to the correct storage.
    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // Also update the master user record in the main database.
    const users = getUsersDatabase();
    const userRecord = users[currentUser.email];
    if(userRecord) {
        // Ensure password isn't overwritten if not provided in details
        const password = userRecord.password;
        const updatedDetails = { ...userRecord, ...details, password };

        // Handle logo removal
        if ('shopLogo' in details && details.shopLogo === undefined) {
            delete updatedDetails.shopLogo;
        }

        users[currentUser.email] = updatedDetails;
        saveUsersDatabase(users);
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
