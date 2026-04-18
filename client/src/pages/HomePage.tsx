import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold tracking-tight text-foreground">Campus<span className="text-primary font-light">OS</span></span>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 overflow-hidden">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-card border border-border ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <UserIcon size={16} className="mr-3" />
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0] || 'Student'}</span>!
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl">
            Here's what's happening around campus today. Explore your clubs, manage your PORs, and stay connected.
          </p>
        </div>

        {/* Dashboard Placeholder */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-2">Upcoming Events</h3>
             <p className="text-foreground/60 text-sm">No events right now.</p>
           </div>
           <div className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-2">My Clubs</h3>
             <p className="text-foreground/60 text-sm">You haven't joined any clubs.</p>
           </div>
           <div className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center space-y-3">
             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon size={24} />
             </div>
             <div>
                <h3 className="font-medium text-foreground">Complete Profile</h3>
                <p className="text-xs text-foreground/50 mt-1">Add your bio and links.</p>
             </div>
             <button onClick={() => navigate('/profile')} className="mt-2 text-sm text-primary font-medium hover:underline">Go to profile</button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
