interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  variant?: 'default' | 'gradient' | 'striped';
}

export function Progress({ 
  value, 
  max = 100, 
  className = "", 
  showValue = false,
  variant = 'default'
}: ProgressProps) {
  const percentage = Math.round((value / max) * 100);

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700';
      case 'striped':
        return 'bg-blue-600 bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className={`${getVariantClasses()} h-2.5 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {percentage}%
        </div>
      )}
    </div>
  );
}
