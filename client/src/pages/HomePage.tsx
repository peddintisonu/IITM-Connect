import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Connections', path: '/followers' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xl leading-none font-bold block mb-0.5">✺</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">CampusOS</span>
            </div>

            <div className="flex items-center gap-8">
              {/* Nav links (desktop) */}
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                {navLinks.map((link) => (
                  <button key={link.path} onClick={() => navigate(link.path)} className="hover:text-primary transition-colors">
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  className="focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm text-primary">{user?.fullName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-[16px] shadow-lg py-2 bg-card border border-border z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-bold text-sm">{user?.displayName || user?.fullName}</p>
                      <p className="text-xs text-foreground/50">@{user?.username || 'handle'}</p>
                    </div>
                    <button onClick={() => navigate('/profile/me')} className="flex items-center w-full px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">
                      My Profile
                    </button>
                    <button onClick={() => navigate('/followers')} className="flex items-center w-full px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors md:hidden">
                      Connections
                    </button>
                    <button onClick={() => navigate('/settings')} className="flex items-center w-full px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">
                      Settings
                    </button>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col items-start space-y-4 max-w-2xl">
          <h1 className="text-4xl lg:text-5xl leading-[1.15] font-bold tracking-tight">
            Welcome back, <span className="text-primary">{user?.displayName || user?.fullName?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="text-lg text-foreground/60 leading-relaxed">
            Here's your personal dashboard. Explore your clubs, manage your connections, and stay up to date.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Profile */}
          <div className="bg-card rounded-[24px] p-8 border border-border hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">My Profile</h3>
              <p className="text-sm text-foreground/50">View and manage your student profile, bio, and links.</p>
            </div>
            <Button variant="primary" className="mt-6 w-full" onClick={() => navigate('/profile/me')}>
              Go to Profile
            </Button>
          </div>

          {/* Card: Connections */}
          <div className="bg-card rounded-[24px] p-8 border border-border hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Connections</h3>
              <p className="text-sm text-foreground/50">See your followers, following, and pending requests.</p>
            </div>
            <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/followers')}>
              View Connections
            </Button>
          </div>

          {/* Card: Settings */}
          <div className="bg-card rounded-[24px] p-8 border border-border hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Settings</h3>
              <p className="text-sm text-foreground/50">Edit profile, manage privacy, and review active sessions.</p>
            </div>
            <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/settings')}>
              Open Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
