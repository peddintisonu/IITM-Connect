import React, { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Layout, Shield, ArrowRight } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    accountType: user?.accountType || 'public',
    currentHostelId: '',
    currentRoomNo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        displayName: formData.displayName,
        username: formData.username,
        accountType: formData.accountType,
      };

      if (formData.currentHostelId) payload.currentHostelId = formData.currentHostelId;
      if (formData.currentRoomNo) payload.currentRoomNo = parseInt(formData.currentRoomNo, 10);

      await api.patch('/api/v1/students/onboarding', payload);
      await refetchUser();
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Half - Illustration */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-primary/5 border-r border-border p-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to CampusOS</h1>
            <p className="text-lg text-foreground/70">Connect with your peers, track clubs, and manage your college life seamlessly.</p>
          </div>
          
          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-4 text-foreground/80">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users size={24} /></div>
              <div>
                <h3 className="font-medium text-foreground">Unified Profile</h3>
                <p className="text-sm">Consolidate your identity across IIT Madras.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-foreground/80">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Layout size={24} /></div>
              <div>
                <h3 className="font-medium text-foreground">Stay Updated</h3>
                <p className="text-sm">Real-time club updates built in.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-foreground/80">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Shield size={24} /></div>
              <div>
                <h3 className="font-medium text-foreground">Verified PORs</h3>
                <p className="text-sm">Never lose track of a responsibility.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Complete your profile</h2>
            <p className="mt-2 text-sm text-foreground/60 text-balance">Just a few details to get you formally registered onto CampusOS.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">{error}</div>}
            
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-sm font-medium text-foreground">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-foreground">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="johndoe123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="currentHostelId" className="block text-sm font-medium text-foreground">Hostel ID <span className="text-foreground/40">(Optional)</span></label>
                <input
                  id="currentHostelId"
                  name="currentHostelId"
                  type="text"
                  value={formData.currentHostelId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Mandakini"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="currentRoomNo" className="block text-sm font-medium text-foreground">Room <span className="text-foreground/40">(Optional)</span></label>
                <input
                  id="currentRoomNo"
                  name="currentRoomNo"
                  type="number"
                  value={formData.currentRoomNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="204"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-sm font-medium text-foreground mb-3">Account Privacy</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="public"
                    checked={formData.accountType === 'public'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-foreground">Public</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="private"
                    checked={formData.accountType === 'private'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-foreground">Private</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Saving...' : 'Save & Continue'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
