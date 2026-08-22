import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CycleProvider>
        <RouterProvider router={router} />
      </CycleProvider>
    </AuthProvider>
  );
};

export default App;
