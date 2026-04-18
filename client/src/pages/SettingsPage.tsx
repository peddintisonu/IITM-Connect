import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfileMutation, useUpdateProfilePhotoMutation, useUpdateCoverPhotoMutation, useUpdatePrivacyMutation, useUpdateHostelMutation } from '../hooks/useStudent';
import { useSessionsQuery, useRevokeSessionMutation, useLogoutAllMutation } from '../hooks/useAuthSessions';
import { useBlockListQuery, useUnblockMutation } from '../hooks/useSocial';
import { Button } from '../components/ui/Button';
import type { ISession } from '../types/session.types';

type SettingsTab = 'profile' | 'privacy' | 'blocking' | 'sessions';

const SettingsPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // --- Profile editing state (initialized from user, re-syncs on remount) ---
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [profileMsg, setProfileMsg] = useState('');

  // --- Privacy state ---
  const [accountType, setAccountType] = useState<'public' | 'private'>(user?.accountType || 'public');
  const [privacyMsg, setPrivacyMsg] = useState('');

  // --- Hostel state ---
  const [hostelId, setHostelId] = useState(user?.currentHostelId || '');
  const [roomNo, setRoomNo] = useState(user?.currentRoomNo?.toString() || '');

  const updateProfileMut = useUpdateProfileMutation();
  const updatePhotoMut = useUpdateProfilePhotoMutation();
  const updateCoverMut = useUpdateCoverPhotoMutation();
  const updatePrivacyMut = useUpdatePrivacyMutation();
  const updateHostelMut = useUpdateHostelMutation();

  // --- Blocking state ---
  const blockListQuery = useBlockListQuery();
  const unblockMut = useUnblockMutation();

  const handleProfileSave = async () => {
    setProfileMsg('');
    try {
      // Update basic profile
      const profilePromise = updateProfileMut.mutateAsync({
        displayName,
        username,
        bio,
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });

      // Update hostel info
      const hostelPromise = updateHostelMut.mutateAsync({
        currentHostelId: hostelId,
        currentRoomNo: parseInt(roomNo) || 0,
      });

      await Promise.all([profilePromise, hostelPromise]);
      await refetchUser();
      setProfileMsg('Profile and hostel information updated successfully.');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setProfileMsg(e.response?.data?.message || 'Failed to update settings.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (type === 'profile') {
        await updatePhotoMut.mutateAsync(file);
      } else {
        await updateCoverMut.mutateAsync(file);
      }
      await refetchUser();
    } catch {
      setProfileMsg('Failed to upload photo.');
    }
  };

  const handlePrivacySave = async () => {
    setPrivacyMsg('');
    try {
      await updatePrivacyMut.mutateAsync({ accountType });
      await refetchUser();
      setPrivacyMsg('Privacy settings saved.');
    } catch {
      setPrivacyMsg('Failed to update privacy settings.');
    }
  };

  // Deleted handleHostelSave as it's merged into handleProfileSave

  // --- Sessions (only fetch when tab is active) ---
  const sessionsQuery = useSessionsQuery(activeTab === 'sessions');
  const revokeMut = useRevokeSessionMutation();
  const logoutAllMut = useLogoutAllMutation();

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'blocking', label: 'Blocking' },
    { id: 'sessions', label: 'Sessions' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-sm font-medium hover:opacity-70 transition-opacity">← Back</button>
          <h1 className="text-lg font-bold">Settings</h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab bar */}
        <div className="flex gap-2 mb-10 border-2 border-foreground rounded-[18px] p-1 bg-background w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-[14px] text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Photo uploads */}
            <div className="bg-card rounded-[28px] p-8 border border-border space-y-6">
              <h2 className="text-xl font-bold">Photos</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-foreground overflow-hidden flex items-center justify-center">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold">{user?.fullName?.charAt(0)}</span>
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'profile')} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">Cover Photo</label>
                  <label className="cursor-pointer block h-20 bg-primary/10 rounded-xl border-2 border-dashed border-foreground/30 flex items-center justify-center hover:border-primary transition-colors overflow-hidden">
                    {user?.coverPhoto ? (
                      <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-foreground/50">Click to upload cover</span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'cover')} />
                  </label>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="bg-card rounded-[28px] p-8 border border-border space-y-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              {profileMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium ${profileMsg.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {profileMsg}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-bold uppercase tracking-wider">Display Name</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold uppercase tracking-wider">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold uppercase tracking-wider">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium resize-none" />
                <p className="text-xs text-foreground/40 text-right">{bio.length}/200</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold uppercase tracking-wider">Interests <span className="text-foreground/40 lowercase text-xs">(comma separated)</span></label>
                <input value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" placeholder="coding, music, chess" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold uppercase tracking-wider">Skills <span className="text-foreground/40 lowercase text-xs">(comma separated)</span></label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" placeholder="React, Node.js, Python" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <label className="block text-sm font-bold uppercase tracking-wider">Hostel Name</label>
                  <input value={hostelId} onChange={(e) => setHostelId(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" placeholder="Ex: Tapti" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold uppercase tracking-wider">Room Number</label>
                  <input type="number" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" placeholder="123" />
                </div>
              </div>

              <Button variant="primary" onClick={handleProfileSave} disabled={updateProfileMut.isPending || updateHostelMut.isPending} className="w-full md:w-auto">
                {updateProfileMut.isPending || updateHostelMut.isPending ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Hostel Tab was here, now deleted */}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-card rounded-[28px] p-8 border border-border space-y-6">
            <h2 className="text-xl font-bold">Privacy Settings</h2>
            {privacyMsg && (
              <div className={`p-3 rounded-xl text-sm font-medium ${privacyMsg.includes('saved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {privacyMsg}
              </div>
            )}
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Account Type</label>
              <div className="flex gap-4">
                {(['public', 'private'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAccountType(type)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm capitalize transition-all ${accountType === type ? 'border-primary bg-primary text-white' : 'border-foreground/20 hover:border-primary/50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-sm text-foreground/60 mt-2">
                {accountType === 'private'
                  ? 'Only approved followers can see your full profile. Follow requests need approval.'
                  : 'Anyone can see your profile and follow you directly.'}
              </p>
            </div>
            <Button variant="primary" onClick={handlePrivacySave} disabled={updatePrivacyMut.isPending}>
              {updatePrivacyMut.isPending ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        )}

        {/* Blocking Tab */}
        {activeTab === 'blocking' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Blocked Users</h2>
            <p className="text-sm text-foreground/60 mb-6">Users you have blocked cannot follow you or view your profile details.</p>

            {blockListQuery.isLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {!blockListQuery.isLoading && !blockListQuery.data?.length && (
              <div className="bg-card rounded-[28px] p-12 border border-border text-center text-foreground/40 font-medium italic">
                You haven't blocked any users.
              </div>
            )}

            <div className="space-y-3">
              {blockListQuery.data?.map((block) => (
                <div key={block._id} className="bg-card rounded-[20px] p-5 border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{block.blockedId.displayName || block.blockedId.fullName || "Student"}</p>
                    <p className="text-xs text-foreground/50">@{block.blockedId.username || 'handle'}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => unblockMut.mutate(block.blockedId._id)}
                    disabled={unblockMut.isPending}
                    className="text-xs text-red-500 hover:bg-red-50"
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Active Sessions</h2>
              <Button
                variant="outline"
                onClick={() => logoutAllMut.mutate()}
                disabled={logoutAllMut.isPending}
                className="text-sm border-red-400 text-red-500 hover:bg-red-50"
              >
                {logoutAllMut.isPending ? 'Logging out...' : 'Logout All Others'}
              </Button>
            </div>

            {sessionsQuery.isLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {sessionsQuery.isError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">Failed to load sessions.</div>
            )}

            {sessionsQuery.data && (
              <div className="space-y-4">
                {sessionsQuery.data.sessions.map((session: ISession) => {
                  const isCurrent = session._id === sessionsQuery.data.currentSessionId;
                  return (
                    <div key={session._id} className={`bg-card rounded-[20px] p-6 border ${isCurrent ? 'border-primary' : 'border-border'} flex items-center justify-between`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{session.deviceInfo || 'Unknown Device'}</p>
                          {isCurrent && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Current</span>}
                        </div>
                        <p className="text-xs text-foreground/50">{session.currentLocation?.city || session.initialLocation?.city || 'Unknown location'} · {session.currentLocation?.country || session.initialLocation?.country || ''}</p>
                        <p className="text-xs text-foreground/40">Last active: {session.lastAccessedAt ? new Date(session.lastAccessedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          onClick={() => revokeMut.mutate(session._id)}
                          disabled={revokeMut.isPending}
                          className="text-xs border-red-300 text-red-500 hover:bg-red-50"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
