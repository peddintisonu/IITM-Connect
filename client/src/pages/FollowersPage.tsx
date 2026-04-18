import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFollowersQuery,
  useFollowingQuery,
  usePendingRequestsQuery,
  useSentRequestsQuery,
  useUnfollowMutation,
  useRemoveFollowerMutation,
  useAcceptFollowMutation,
  useRejectFollowMutation,
  useCancelFollowMutation,
} from '../hooks/useSocial';
import { Button } from '../components/ui/Button';
import type { IFollowListItem } from '../types/social.types';

type SocialTab = 'followers' | 'following' | 'requests' | 'sent';

const UserCard: React.FC<{
  user: IFollowListItem;
  actions: React.ReactNode;
  onViewProfile: () => void;
}> = ({ user, actions, onViewProfile }) => (
  <div className="bg-card rounded-[20px] p-5 border border-border flex items-center justify-between hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-4 cursor-pointer" onClick={onViewProfile}>
      <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.displayName || user.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-lg">{(user.displayName || user.fullName).charAt(0)}</span>
        )}
      </div>
      <div>
        <p className="font-bold text-sm">{user.displayName || user.fullName}</p>
        {user.username && <p className="text-xs text-foreground/50">@{user.username}</p>}
      </div>
    </div>
    <div className="flex gap-2 shrink-0">{actions}</div>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-foreground/40">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-2xl">👤</div>
    <p className="font-medium">{message}</p>
  </div>
);

const FollowersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SocialTab>('followers');

  const followersQuery = useFollowersQuery();
  const followingQuery = useFollowingQuery();
  const pendingQuery = usePendingRequestsQuery();
  const sentQuery = useSentRequestsQuery();

  const unfollowMut = useUnfollowMutation();
  const removeFollowerMut = useRemoveFollowerMutation();
  const acceptMut = useAcceptFollowMutation();
  const rejectMut = useRejectFollowMutation();
  const cancelMut = useCancelFollowMutation();

  const tabs: { id: SocialTab; label: string; count?: number }[] = [
    { id: 'followers', label: 'Followers', count: followersQuery.data?.length },
    { id: 'following', label: 'Following', count: followingQuery.data?.length },
    { id: 'requests', label: 'Requests', count: pendingQuery.data?.length },
    { id: 'sent', label: 'Sent', count: sentQuery.data?.length },
  ];

  const renderList = () => {
    switch (activeTab) {
      case 'followers': {
        if (followersQuery.isLoading) return <LoadingSpinner />;
        if (!followersQuery.data?.length) return <EmptyState message="No followers yet." />;
        return followersQuery.data.map((u: IFollowListItem) => (
          <UserCard
            key={u._id}
            user={u}
            onViewProfile={() => navigate(`/profile/${u.username || u._id}`)}
            actions={
              <Button variant="outline" onClick={() => removeFollowerMut.mutate(u._id)} disabled={removeFollowerMut.isPending} className="text-xs">
                Remove
              </Button>
            }
          />
        ));
      }
      case 'following': {
        if (followingQuery.isLoading) return <LoadingSpinner />;
        if (!followingQuery.data?.length) return <EmptyState message="Not following anyone yet." />;
        return followingQuery.data.map((u: IFollowListItem) => (
          <UserCard
            key={u._id}
            user={u}
            onViewProfile={() => navigate(`/profile/${u.username || u._id}`)}
            actions={
              <Button variant="outline" onClick={() => unfollowMut.mutate(u._id)} disabled={unfollowMut.isPending} className="text-xs">
                Unfollow
              </Button>
            }
          />
        ));
      }
      case 'requests': {
        if (pendingQuery.isLoading) return <LoadingSpinner />;
        if (!pendingQuery.data?.length) return <EmptyState message="No pending requests." />;
        return pendingQuery.data.map((u: IFollowListItem) => (
          <UserCard
            key={u._id}
            user={u}
            onViewProfile={() => navigate(`/profile/${u.username || u._id}`)}
            actions={
              <>
                <Button variant="primary" onClick={() => acceptMut.mutate(u._id)} disabled={acceptMut.isPending} className="text-xs">
                  Accept
                </Button>
                <Button variant="outline" onClick={() => rejectMut.mutate(u._id)} disabled={rejectMut.isPending} className="text-xs">
                  Reject
                </Button>
              </>
            }
          />
        ));
      }
      case 'sent': {
        if (sentQuery.isLoading) return <LoadingSpinner />;
        if (!sentQuery.data?.length) return <EmptyState message="No sent requests." />;
        return sentQuery.data.map((u: IFollowListItem) => (
          <UserCard
            key={u._id}
            user={u}
            onViewProfile={() => navigate(`/profile/${u.username || u._id}`)}
            actions={
              <Button variant="outline" onClick={() => cancelMut.mutate(u._id)} disabled={cancelMut.isPending} className="text-xs">
                Cancel
              </Button>
            }
          />
        ));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border bg-background py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-sm font-medium hover:opacity-70 transition-opacity">← Back</button>
          <h1 className="text-lg font-bold">Connections</h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-2 border-foreground/15 rounded-[18px] p-1 bg-background overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-[14px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-foreground/10'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">{renderList()}</div>
      </main>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

export default FollowersPage;
