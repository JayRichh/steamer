interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, max, className = "", showLabel = false }: ProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {percentage}% ({value} of {max})
        </div>
      )}
    </div>
  );
}
