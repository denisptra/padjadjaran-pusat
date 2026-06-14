import React from 'react';
import AuthLeftColumn from './AuthLeftColumn';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Column - Philosophy & Branding (visible on lg screens and above) */}
      <div className="lg:w-1/2 flex-shrink-0">
        <AuthLeftColumn />
      </div>

      {/* Right Column - Form Container */}
      <div className="lg:w-1/2 flex flex-col items-center px-6 sm:px-12 lg:px-16 py-8 lg:py-12 bg-white overflow-y-auto lg:h-screen w-full">
        <div className="lg:hidden w-full flex justify-center mb-10">
          <Link to="/">
            <Logo theme="dark" />
          </Link>
        </div>
        <div className="w-full max-w-md my-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
