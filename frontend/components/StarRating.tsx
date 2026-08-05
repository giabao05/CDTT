import { Star } from 'lucide-react';

interface Props {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, count, size = 14, showCount = true }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.floor(rating);
          const partial = !filled && star === Math.ceil(rating) && rating % 1 > 0;
          return (
            <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="text-zinc-200"
                fill="#e4e4e7"
                strokeWidth={0}
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
                >
                  <Star
                    size={size}
                    fill="#F59E0B"
                    strokeWidth={0}
                    className="text-amber-400"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-zinc-500 font-mono-data">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-1 text-zinc-400">({count.toLocaleString('vi-VN')})</span>
          )}
        </span>
      )}
    </div>
  );
}
