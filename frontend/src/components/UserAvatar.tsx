import React, { useEffect, useState } from 'react';
import { getAvatar } from '../lib/avatar';

interface UserAvatarProps {
  name?: string;
  userId?: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: string;
  ring?: string;
  refreshKey?: number | string;
}

const SIZES: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

// Default avatar: initials circle. Shows uploaded photo only if the user set one.
// This replaces the old hardcoded random ALEX_AVATAR_URL everywhere.
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  userId,
  size = 'md',
  rounded = 'rounded-xl',
  ring = 'ring-1 ring-gray-200',
  refreshKey,
}) => {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    setPhoto(getAvatar(userId));
  }, [userId, refreshKey]);

  const initial = (name || 'S').trim().slice(0, 1).toUpperCase();

  if (photo) {
    return (
      <img
        alt={name || 'Profile'}
        className={`${SIZES[size]} ${rounded} object-cover ${ring} shrink-0`}
        src={photo}
      />
    );
  }

  return (
    <div
      aria-label={name || 'Profile'}
      className={`${SIZES[size]} ${rounded} ${ring} bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0`}
    >
      {initial}
    </div>
  );
};
