// src/components/Skeleton.tsx
import React from 'react';

export const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded"></div>
      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
