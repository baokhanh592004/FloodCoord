import React from 'react'
import AppRoutes from  './routes/AppRoutes.jsx'     
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </>
  )
}
