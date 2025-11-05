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


// --- Initial Seeding for Demo Users ---

const seedInitialUsers = () => {
    const users = getUsersDatabase();
    
    // Standard Demo User
    const demoEmail = 'demo@example.com';
    if (!users[demoEmail]) {
        users[demoEmail] = {
            id: 'user-1',
            email: demoEmail,
            password: 'password123', // In a real app, this would be hashed
            name: 'Alex Doe',
            shopName: 'Alex\'s Corner Shop',
            shopLogo: `https://i.pravatar.cc/150?u=user-1`,
            shopAddress: '123 Market Street, Mumbai, Maharashtra, 400001',
            phoneNumber: '9876543210',
            gstNumber: '27ABCDE1234F1Z5',
            taxRate: 5, // 5%
        };
    }

    // "Kaggle" Data Analysis User
    const kaggleEmail = 'laksh@gmail.com';
    if (!users[kaggleEmail]) {
        users[kaggleEmail] = {
            id: 'user-kaggle', // Special ID to identify this user
            email: kaggleEmail,
            password: '123456',
            name: 'Laksh',
            shopName: 'Laksh\'s Grocery Analytics',
            shopLogo: `https://i.pravatar.cc/150?u=user-kaggle`,
            shopAddress: '456 Kaggle Drive, Data City, 560001',
            phoneNumber: '9123456780',
            gstNumber: '29LMNOP5678G1Z9',
            taxRate: 5,
        };
    }

    saveUsersDatabase(users);
};
seedInitialUsers();


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
    const normalizedEmail = email.toLowerCase().trim();
    const users = getUsersDatabase();
    const userData = users[normalizedEmail];

    if (!userData) {
      return { success: false, error: 'user_not_found' };
    }
    
    if (userData.password !== pass) {
        return { success: false, error: 'incorrect_password' };
    }

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
  };

  const signup = (details: Omit<User, 'id'> & {password: string}) => {
    const normalizedEmail = details.email.toLowerCase().trim();
    const users = getUsersDatabase();
    
    if (users[normalizedEmail]) {
        return { success: false, error: 'This email is already registered. Please log in instead.' };
    }
    
    const newUserId = uuidv4();
    const newUserForDb = {
        id: newUserId,
        email: normalizedEmail,
        password: details.password, // In a real app, this MUST be hashed!
        name: details.name,
        shopName: details.shopName,
        shopLogo: details.shopLogo,
        shopAddress: details.shopAddress,
        phoneNumber: details.phoneNumber,
        gstNumber: details.gstNumber,
        taxRate: details.taxRate,
    };
    users[normalizedEmail] = newUserForDb;
    saveUsersDatabase(users);

    // Automatically log in the new user (session only for new signups)
    const userForState: User = {
      id: newUserId,
      email: normalizedEmail,
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

    // Normalize email if it's part of the update, though this is unlikely/discouraged
    const normalizedDetails = details.email 
        ? { ...details, email: details.email.toLowerCase().trim() }
        : details;

    const updatedUser = { ...currentUser, ...normalizedDetails };
    setCurrentUser(updatedUser);

    // Persist the updated user session to the correct storage.
    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // Also update the master user record in the main database.
    const users = getUsersDatabase();
    const userRecord = users[currentUser.email]; // Find by old email
    if(userRecord) {
        const oldEmail = currentUser.email;
        // Ensure password isn't overwritten if not provided in details
        const password = userRecord.password;
        const updatedDetailsForDb = { ...userRecord, ...normalizedDetails, password };

        // Handle logo removal
        if ('shopLogo' in normalizedDetails && normalizedDetails.shopLogo === undefined) {
            delete updatedDetailsForDb.shopLogo;
        }

        // If email has changed, we need to update the key in the database
        const newEmail = updatedDetailsForDb.email;
        if (oldEmail !== newEmail) {
            delete users[oldEmail];
        }
        users[newEmail] = updatedDetailsForDb;
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