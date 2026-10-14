// src/app/layout.js
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ToastProvider from '@/components/ToastProvider';

export const metadata = {
  title: 'SAP Leave Management System',
  description: 'SAP BTP ABAP RAP + Next.js Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 font-sans">
        <AuthProvider>
          <ToastProvider />
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
