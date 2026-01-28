import React from 'react'
import AppRoutes from  './routes/AppRoutes.jsx'     
import { Toaster } from 'react-hot-toast';
export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  )
}
