/* eslint-disable react/prop-types */
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm p-4 relative top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Bombot Logo" className="h-8 w-8" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Bombot
                        </h1>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 relative min-h-[inherit]">
                {children}
            </main>
            <footer className="bg-white border-t mt-auto py-6 relative bottom-0">
                <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Bombot Application. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
