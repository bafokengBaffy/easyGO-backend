import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg', xl: 'w-16 h-16 text-xl' };
  const getInitials = () => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return src ? (<img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]} ${className}`} />) : (
    <div className={`rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600 ${sizes[size]} ${className}`}>{getInitials()}</div>
  );
};

export default Avatar;
