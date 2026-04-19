import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfileQuery } from '../hooks/useStudent';
import { useRelationshipQuery, useFollowMutation, useUnfollowMutation, useCancelFollowMutation, useBlockMutation, useUnblockMutation } from '../hooks/useSocial';
import { Button } from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const isMe = username === 'me' || username === authUser?.username;
  const lookupUsername = isMe ? authUser?.username : username;

  const { data: profile, isLoading, isError } = useProfileQuery(lookupUsername || '');
  const displayProfile = isMe ? (profile || authUser) : profile;

  // Only fetch relationship for other people's profiles
  const { data: relationship } = useRelationshipQuery(
    (!isMe && displayProfile?._id) ? displayProfile._id : ''
  );

  // CRITICAL: Backend now populates currentDeptId, currentCourseId, and currentHostelId
  // with objects containing 'name'. No need for manual resolution maps.
  
  const isHidden = (field: string) => displayProfile?.privacySettings?.hiddenFields?.includes(field);

  // Helper to extract name from populated academic field
  const getAcademicName = (field: any) => {
    if (!field) return undefined;
    if (typeof field === 'object' && field.name) return field.name;
    return field; // Fallback to raw value if not populated
  };

  const followMut = useFollowMutation();
  const unfollowMut = useUnfollowMutation();
  const cancelMut = useCancelFollowMutation();
  const blockMut = useBlockMutation();
  const unblockMut = useUnblockMutation();

  const handleFollowAction = () => {
    if (!displayProfile) return;
    if (relationship?.followingStatus === 'accepted') {
      unfollowMut.mutate(displayProfile._id);
    } else if (relationship?.followingStatus === 'pending') {
      cancelMut.mutate(displayProfile._id);
    } else {
      followMut.mutate(displayProfile._id);
    }
  };

  const handleBlockAction = () => {
    if (!displayProfile) return;
    if (relationship?.blockedByMe) {
      unblockMut.mutate(displayProfile._id);
    } else {
      if (window.confirm(`Are you sure you want to block ${displayProfile.displayName || displayProfile.fullName}?`)) {
        blockMut.mutate(displayProfile._id);
      }
    }
  };

  const getFollowButtonLabel = () => {
    if (relationship?.followingStatus === 'accepted') return 'Unfollow';
    if (relationship?.followingStatus === 'pending') return 'Cancel Request';
    return 'Follow';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-foreground/50 font-medium">Loading Profile</p>
      </div>
    );
  }

  if (isError || (!displayProfile && !isMe)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card p-12 border border-border rounded-[28px] max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="mb-6 text-foreground/60">The requested profile does not exist or has been hidden.</p>
          <Button variant="primary" onClick={() => navigate('/home')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="text-sm font-medium hover:opacity-70 transition-opacity">← Back</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-[28px] overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-40 bg-gradient-to-br from-primary/30 to-primary/10 relative overflow-hidden">
            {displayProfile?.coverPhoto && (
              <img src={displayProfile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="flex justify-between items-end -mt-14 mb-6">
              <div className="h-28 w-28 rounded-full bg-background border-4 border-card overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {displayProfile?.profilePhoto ? (
                  <img src={displayProfile.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{displayProfile?.fullName?.charAt(0) || 'U'}</span>
                )}
              </div>

              <div className="flex gap-3">
                {isMe ? (
                  <Button variant="outline" onClick={() => navigate('/settings')} className="text-sm">Edit Profile</Button>
                ) : (
                  <>
                    {!relationship?.blockedMe && (
                      <Button
                        variant={relationship?.followingStatus === 'accepted' ? 'outline' : 'primary'}
                        onClick={handleFollowAction}
                        disabled={followMut.isPending || unfollowMut.isPending || cancelMut.isPending || relationship?.blockedByMe}
                        className="text-sm"
                      >
                        {getFollowButtonLabel()}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleBlockAction}
                      disabled={blockMut.isPending || unblockMut.isPending}
                      className={`text-sm ${relationship?.blockedByMe ? 'text-red-500 border-red-200' : ''}`}
                    >
                      {relationship?.blockedByMe ? 'Unblock' : 'Block'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{displayProfile?.displayName || displayProfile?.fullName}</h1>
                <p className="text-foreground/50 text-sm mt-0.5">@{displayProfile?.username || 'handle'}</p>
              </div>

              {displayProfile?.bio && (
                <p className="text-foreground/80 leading-relaxed max-w-xl">{displayProfile.bio}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${displayProfile?.accountType === 'private' ? 'border-foreground/20 bg-foreground/5' : 'border-primary/30 bg-primary/10 text-primary'}`}>
                  {displayProfile?.accountType === 'private' ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Info */}
          <div className="bg-card rounded-[24px] p-8 border border-border space-y-4">
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <InfoRow 
              label="Email" 
              value={displayProfile?.email} 
              fallback="Not set" 
              isHidden={isHidden('email')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Roll No" 
              value={displayProfile?.currentRollNo} 
              fallback="Not set" 
              isHidden={isHidden('rollNo')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Batch" 
              value={displayProfile?.currentBatch?.toString()} 
              fallback="Not set" 
              isHidden={isHidden('batch')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Year" 
              value={displayProfile?.graduationYear?.toString()} 
              fallback="Not set" 
              isHidden={isHidden('graduationYear')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Dept" 
              value={getAcademicName(displayProfile?.currentDeptId)} 
              fallback="Not set" 
              isHidden={isHidden('dept')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Course" 
              value={getAcademicName(displayProfile?.currentCourseId)} 
              fallback="Not set" 
              isHidden={isHidden('course')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Hostel" 
              value={getAcademicName(displayProfile?.currentHostelId)} 
              fallback="Not set" 
              isHidden={isHidden('hostel')} 
              isMe={isMe} 
            />
            <InfoRow 
              label="Room" 
              value={displayProfile?.currentRoomNo?.toString()} 
              fallback="Not set" 
              isHidden={isHidden('roomNo')} 
              isMe={isMe} 
            />
          </div>

          {/* Skills & Interests */}
          <div className="bg-card rounded-[24px] p-8 border border-border space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Interests</h3>
              {displayProfile?.interests && displayProfile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {displayProfile.interests.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{item}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/40">No interests listed.</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Skills</h3>
              {displayProfile?.skills && displayProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {displayProfile.skills.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-foreground/10 text-foreground/80 text-xs font-bold rounded-full">{item}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/40">No skills listed.</p>
              )}
            </div>
          </div>

          {/* Links */}
          {displayProfile?.links && displayProfile.links.length > 0 && (
            <div className="bg-card rounded-[24px] p-8 border border-border md:col-span-2">
              <h3 className="text-lg font-bold mb-4">Links</h3>
              <div className="flex flex-wrap gap-3">
                {displayProfile.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary/10 text-primary font-medium text-sm rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const InfoRow: React.FC<{ 
  label: string; 
  value: string | number | undefined; 
  fallback: string; 
  isHidden?: boolean; 
  isMe?: boolean;
}> = ({ label, value, fallback, isHidden, isMe }) => {
  // CRITICAL PRIVACY logic: 
  // If viewing someone else's profile, hide the row entirely if it's marked as hidden 
  // OR if the value is missing (undefined/null/empty string).
  if (!isMe) {
    if (isHidden || value === undefined || value === null || value === '') {
      return null;
    }
  }

  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span className="text-sm">
          <span className="font-medium">{label}:</span>{' '}
          <span className={value ? '' : 'text-foreground/40 italic'}>{value || fallback}</span>
        </span>
      </div>
      
      {/* Show privacy tag only for self view */}
      {isMe && (
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md border ${isHidden ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {isHidden ? (
            <><EyeOff size={10} /> Hidden</>
          ) : (
            <><Eye size={10} /> Visible</>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
