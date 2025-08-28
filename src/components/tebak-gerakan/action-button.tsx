const ActionButton = ({
  onClick,
  disabled,
  type,
}: {
  onClick: () => void;
  disabled?: boolean;
  type: 'check' | 'next';
}) => {
  const buttonConfig = {
    check: {
      text: 'Cek Gerakan!',
      bgClass:
        'bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600',
      shadowClass: 'bg-orange-600',
      icon: '🎯',
    },
    next: {
      text: 'Lanjut',
      bgClass:
        'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600',
      shadowClass: 'bg-green-600',
      icon: '✨',
    },
  };
  const config = buttonConfig[type];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative rounded-full px-6 py-3 font-comic text-lg font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale sm:px-10 sm:py-4 sm:text-xl ${config.bgClass} ${type === 'next' ? 'animate-pulse' : ''}`}
    >
      {' '}
      <div
        className={`absolute inset-0 rounded-full ${config.shadowClass} -z-10 translate-y-1.5 sm:translate-y-2`}
      ></div>{' '}
      <span className="flex items-center gap-2">
        {' '}
        <span className="text-2xl sm:text-3xl">{config.icon}</span>{' '}
        <span className="whitespace-nowrap">{config.text}</span>{' '}
      </span>{' '}
    </button>
  );
};

export default ActionButton;
