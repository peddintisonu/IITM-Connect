import React from 'react';
import Navigation from '../components/Navigation';
import VideoBackground from '../components/VideoBackground';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const App: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-primary/30">
            <VideoBackground />
            <Navigation />

            <main className="relative z-10 flex flex-col justify-end min-h-screen px-8 pb-32 max-w-7xl mx-auto h-[100dvh]">
                <div className="max-w-3xl slide-up-animation">
                    <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                        A Unified Campus. <br />
                        <span className="text-white/80">Seamless Life.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed font-light">
                        Stay plugged into IIT Madras. Experience real-time club
                        updates, automated POR tracking, interactive polls, and
                        dynamic event discovery, all centralized in one powerful
                        platform.
                    </p>

                    <a
                        href={`${API_BASE_URL}/api/v1/auth/google`}
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-black bg-white rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transform hover:-translate-y-1"
                    >
                        Get started via smail
                    </a>
                </div>
            </main>

            <style>{`
        .slide-up-animation {
          animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default App;
