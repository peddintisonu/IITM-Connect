import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/student.service';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const OnboardingPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    accountType: (user?.accountType || 'public') as 'public' | 'private',
    currentHostelId: user?.currentHostelId || '',
    currentRoomNo: user?.currentRoomNo?.toString() || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUsername = useCallback(async (uname: string) => {
    if (uname.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const result = await studentService.checkUsername(uname);
      setUsernameStatus(result.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username.length >= 3) {
        checkUsername(formData.username);
      }
    }, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [formData.username, checkUsername]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'taken') {
      setError('Username is already taken.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await studentService.onboard({
        displayName: formData.displayName,
        username: formData.username,
        accountType: formData.accountType,
        currentHostelId: formData.currentHostelId || undefined,
        currentRoomNo: formData.currentRoomNo ? parseInt(formData.currentRoomNo) : undefined,
      });
      await refetchUser();
      navigate('/home');
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Something went wrong during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans text-foreground">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-primary/5 border-r border-border p-12 relative overflow-hidden">
        <div className="max-w-md space-y-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xl leading-none font-bold block mb-0.5">✺</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">CampusOS</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome aboard!</h1>
            <p className="text-lg text-foreground/70 leading-relaxed">Set up your identity to start connecting with your campus community.</p>
          </div>

          <div className="space-y-5 pt-4 border-t border-border">
            {['Pick a unique username', 'Set your display name', 'Choose your privacy level'].map((step, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{i + 1}</div>
                <span className="font-medium text-foreground/80">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h2>
            <p className="text-foreground/60">Just a few details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl font-medium border border-red-200">{error}</div>}

            <div className="space-y-1">
              <label htmlFor="displayName" className="block text-sm font-bold uppercase tracking-wider">Display Name</label>
              <input
                id="displayName" name="displayName" type="text" required
                value={formData.displayName} onChange={handleChange}
                className="w-full px-4 py-3 bg-background border-2 border-foreground/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-bold uppercase tracking-wider">Username</label>
              <input
                id="username" name="username" type="text" required
                value={formData.username} onChange={handleChange}
                className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium ${
                  usernameStatus === 'available' ? 'border-green-400' : usernameStatus === 'taken' ? 'border-red-400' : 'border-foreground/15'
                }`}
                placeholder="johndoe123"
              />
              <div className="h-5">
                {usernameStatus === 'checking' && <p className="text-xs text-foreground/50">Checking availability...</p>}
                {usernameStatus === 'available' && <p className="text-xs text-green-600 font-medium">✓ Username is available</p>}
                {usernameStatus === 'taken' && <p className="text-xs text-red-500 font-medium">✗ Username is taken</p>}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold uppercase tracking-wider">Account Privacy & Hostel (Optional)</label>
              <div className="flex gap-4">
                {(['public', 'private'] as const).map((type) => (
                  <label key={type} className="flex-1 cursor-pointer">
                    <input type="radio" name="accountType" value={type} checked={formData.accountType === type} onChange={handleChange} className="sr-only peer" />
                    <div className={`text-center py-3 rounded-xl border-2 font-bold text-sm capitalize transition-all ${formData.accountType === type ? 'border-primary bg-primary text-white' : 'border-foreground/15 hover:border-primary/40'}`}>
                      {type}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="currentHostelId" className="block text-sm font-bold uppercase tracking-wider">Hostel Name</label>
                <input
                  id="currentHostelId" name="currentHostelId" type="text"
                  value={formData.currentHostelId} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border-2 border-foreground/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                  placeholder="Ex: Tapti"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="currentRoomNo" className="block text-sm font-bold uppercase tracking-wider">Room</label>
                <input
                  id="currentRoomNo" name="currentRoomNo" type="number"
                  value={formData.currentRoomNo} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border-2 border-foreground/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" disabled={loading || usernameStatus === 'taken'} className="w-full py-3.5 font-bold">
                {loading ? 'Creating...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
