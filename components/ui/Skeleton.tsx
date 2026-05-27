/* Skeleton — shimmer placeholder for loading states.
   Usage: <Skeleton className="w-full h-32 rounded-xl" />
*/
export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gray-100 overflow-hidden relative ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
          animation: 'skeletonShimmer 1.6s ease-in-out infinite',
        }}
      />
    </div>
  );
}
