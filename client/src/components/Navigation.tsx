import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const Navigation: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 mx-8 mt-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                    Campus<span className="text-primary font-light">OS</span>
                </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
                <a
                    href="#home"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                    Home
                </a>
                <a
                    href="#features"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                    Features
                </a>
                {/* <a href="#clubs" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Clubs</a>
        <a href="#events" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Events</a> */}
                <a
                    href="#about"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                    About
                </a>
            </div>

            <div className="flex items-center space-x-4">
                <a
                    href={`${API_BASE_URL}/api/v1/auth/google`}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                    Login
                </a>
                <a
                    href={`${API_BASE_URL}/api/v1/auth/google`}
                    className="px-5 py-2.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5"
                >
                    Get Started
                </a>
            </div>
        </nav>
    );
};

export default Navigation;
