import { StarIcon } from '@/components/icons';

const ScoreDisplay = ({
  score,
  feedbackPoints,
}: {
  score: number;
  feedbackPoints?: { points: number; key: number };
}) => (
  <div className="relative flex min-w-0 flex-shrink items-center gap-1 rounded-full border-2 border-white/50 bg-gradient-to-br from-yellow-300 to-yellow-400 px-3 py-1.5 shadow-lg sm:gap-2 sm:px-4 sm:py-2">
    {' '}
    <StarIcon className="size-4 flex-shrink-0 animate-pulse text-yellow-600 sm:size-5" />{' '}
    <div className="min-w-0 text-center">
      {' '}
      <p className="text-xs font-bold text-yellow-800">SKOR</p>{' '}
      <p className="text-base font-bold text-yellow-900 sm:text-xl">
        {score}
      </p>{' '}
    </div>{' '}
    <StarIcon className="size-4 flex-shrink-0 animate-pulse text-yellow-600 sm:size-5" />{' '}
    {feedbackPoints && (
      <div
        key={feedbackPoints.key}
        className="absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 transform animate-bounce"
      >
        {' '}
        <div className="absolute bottom-full left-1/2 size-0 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-green-500"></div>{' '}
        <div className="rounded-full bg-green-500 px-2 py-1 text-sm font-bold text-white shadow-lg sm:px-3 sm:text-lg">
          {' '}
          +{feedbackPoints.points}{' '}
        </div>{' '}
      </div>
    )}{' '}
  </div>
);

export default ScoreDisplay;
