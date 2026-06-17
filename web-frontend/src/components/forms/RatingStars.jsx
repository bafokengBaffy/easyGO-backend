import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, size = 'md', readonly = false }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const [hover, setHover] = React.useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" disabled={readonly} onClick={() => onRatingChange?.(star)} onMouseEnter={() => !readonly && setHover(star)} onMouseLeave={() => !readonly && setHover(0)} className="focus:outline-none">
          <Star className={`${sizes[size]} ${(hover || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
