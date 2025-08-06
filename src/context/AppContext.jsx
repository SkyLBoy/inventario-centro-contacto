import React from 'react';
import { AuthProvider } from './AuthContext';
import { InventoryProvider } from './InventoryContext';

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <InventoryProvider>
        {children}
      </InventoryProvider>
    </AuthProvider>
  );
};