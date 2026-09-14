import React from 'react';
import ParticleBackground from './ParticleBackground';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden flex flex-col selection:bg-indigo-500/30 w-full relative">
            <ParticleBackground />
            <div className="background-aurora pointer-events-none"></div>
            
            <Navbar />
            
            <main className="flex-1 flex flex-col w-full relative z-10">
                {children}
            </main>
            
            <Footer />
        </div>
    );
};

export default MainLayout;
