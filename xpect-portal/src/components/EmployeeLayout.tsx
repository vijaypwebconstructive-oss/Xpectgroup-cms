import React from 'react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

/**
 * Employee Layout - No header, no navigation, clean onboarding UI only
 */
const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f2f6f9]">
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-2 px-4 text-center text-[#4c669a] text-sm border-t border-[#e7ebf3] bg-white">
        <p>© 2026 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.</p>
      </footer>
    </div>
  );
};

export default EmployeeLayout;
