import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Globe, MapPin, Hash, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="h-32 bg-primary/10 relative overflow-hidden">
             {/* Abstract pattern inside banner */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex justify-between items-end -mt-12 mb-6">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-card flex items-center justify-center overflow-hidden flex-shrink-0 z-10 shadow-md">
                 {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                    <span className="text-4xl font-bold text-primary">{user?.fullName?.charAt(0) || 'U'}</span>
                 )}
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium text-sm rounded-xl transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{user?.displayName || user?.fullName}</h1>
                <p className="text-foreground/60 text-lg">@{user?.username || 'username_not_set'}</p>
                <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wider">
                  {user?.accountType} Account
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-center space-x-3 text-foreground/80">
                  <Mail size={18} className="text-foreground/40" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-foreground/80">
                  <MapPin size={18} className="text-foreground/40" />
                  <span className="text-sm text-foreground/50 italic">Hostel Info Hidden/Not Set</span>
                </div>
                <div className="flex items-center space-x-3 text-foreground/80">
                  <Hash size={18} className="text-foreground/40" />
                  <span className="text-sm text-foreground/50 italic">Roll No Hidden</span>
                </div>
                <div className="flex items-center space-x-3 text-foreground/80">
                  <Globe size={18} className="text-foreground/40" />
                  <span className="text-sm text-foreground/50 italic">No links added</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
