// ponytail: avatar stored as localStorage dataURL, backend column if cross-device needed.
export function avatarKey(userId?: string | number): string {
  return userId ? `slc_avatar_${userId}` : 'slc_avatar';
}

export function getAvatar(userId?: string | number): string | null {
  try {
    return (
      localStorage.getItem(avatarKey(userId)) ||
      localStorage.getItem('slc_avatar')
    );
  } catch {
    return null;
  }
}

export function setAvatar(dataUrl: string, userId?: string | number): void {
  try {
    localStorage.setItem(avatarKey(userId), dataUrl);
    localStorage.setItem('slc_avatar', dataUrl);
  } catch {
    // storage full/blocked — avatar just won't persist
  }
}

export function clearAvatar(userId?: string | number): void {
  try {
    localStorage.removeItem(avatarKey(userId));
    if (!userId) localStorage.removeItem('slc_avatar');
  } catch {
    // ignore
  }
}

// Downscale uploads to a small square dataURL so localStorage stays tiny.
export function fileToAvatarDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size
      );
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}
