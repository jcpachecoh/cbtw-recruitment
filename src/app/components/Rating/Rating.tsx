'use client';

import React, { useState } from 'react';

interface RatingProps {
    totalStars?: number;
    initialRating?: number;
    onRating: (rating: number) => void;
}

const Star: React.FC<{
    filled: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => {
    return (
        <svg
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
};

const Rating: React.FC<RatingProps> = ({ totalStars = 5, initialRating = 0, onRating }) => {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (rating: number) => {
        setCurrentRating(rating);
        onRating(rating);
    };

    return (
        <div className="flex items-center space-x-1">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <Star
                        key={starValue}
                        filled={starValue <= (hoverRating || currentRating)}
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                );
            })}
            {currentRating > 0 && (
                <span className="ml-2 text-gray-600 text-sm">({currentRating} out of {totalStars})</span>
            )}
        </div>
    );
};

export default Rating;
