import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';
import { SymptomProvider } from './context/SymptomContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CycleProvider>
        <SymptomProvider>
          <RouterProvider router={router} />
        </SymptomProvider>
      </CycleProvider>
    </AuthProvider>
  );
};

export default App;
