import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "small" | "medium" | "large";
  count?: number;
  readOnly?: boolean;
  className?: string;
}

const Rating = ({
  value = 0,
  onChange,
  size = "medium",
  count = 5,
  readOnly = false,
  className,
}: RatingProps) => {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  // Update internal rating when value prop changes
  useEffect(() => {
    setRating(value);
  }, [value]);

  const handleClick = (newRating: number) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  // Size classes for stars
  const sizeClasses = {
    small: "h-3 w-3",
    medium: "h-5 w-5",
    large: "h-7 w-7"
  };

  const starSize = sizeClasses[size];

  return (
    <div 
      className={cn("flex items-center", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[...Array(count)].map((_, index) => {
        const starValue = index + 1;
        const isActive = (hoverRating || rating) >= starValue;
        const isPartiallyFilled = !Number.isInteger(rating) && 
                                 Math.ceil(rating) === starValue && 
                                 !hoverRating;
        
        return (
          <div
            key={index}
            className={cn(
              "cursor-pointer relative transition-transform", 
              !readOnly && "hover:scale-110",
              !readOnly && "hover:text-yellow-400"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            role="radio"
            aria-checked={rating >= starValue}
            tabIndex={readOnly ? -1 : 0}
          >
            {isPartiallyFilled ? (
              <div className="relative">
                <Star 
                  className={cn(
                    starSize, 
                    "text-gray-400",
                    "stroke-[1.5px]",
                  )} 
                />
                <div 
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(rating % 1) * 100}%` }}
                >
                  <Star 
                    className={cn(
                      starSize, 
                      "text-yellow-400 fill-yellow-400",
                      "stroke-[1.5px]",
                    )} 
                  />
                </div>
              </div>
            ) : (
              <Star 
                className={cn(
                  starSize, 
                  isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-400",
                  "stroke-[1.5px]",
                )} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Rating;
