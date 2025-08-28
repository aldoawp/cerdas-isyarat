import { ClockIcon } from '@/components/icons';

const TimerDisplay = ({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;
  return (
    <div className="w-full max-w-[160px]">
      {' '}
      <div className="flex items-center justify-center gap-2">
        {' '}
        <ClockIcon className="size-4 text-purple-600 sm:size-5" />{' '}
        <span className="font-comic text-sm font-bold text-purple-800 drop-shadow-sm sm:text-base">
          {' '}
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}{' '}
        </span>{' '}
      </div>{' '}
      <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full border-2 border-white/20 bg-white/30 shadow-inner sm:h-3">
        {' '}
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${percentage > 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : percentage > 25 ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'animate-pulse bg-gradient-to-r from-red-400 to-red-500'}`}
          style={{ width: `${percentage}%` }}
        />{' '}
      </div>{' '}
    </div>
  );
};

export default TimerDisplay;
