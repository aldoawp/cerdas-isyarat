const QuestionCounter = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="min-w-0 flex-shrink-0 rounded-full border-2 border-white/50 bg-gradient-to-br from-purple-400 to-purple-500 px-3 py-1.5 shadow-lg sm:px-4 sm:py-2">
    {' '}
    <div className="flex items-center gap-1 sm:gap-2">
      {' '}
      <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-white sm:size-6">
        {' '}
        <span className="text-xs font-bold text-purple-600 sm:text-sm">
          {current}
        </span>{' '}
      </div>{' '}
      <span className="text-sm font-bold text-white sm:text-base">/</span>{' '}
      <span className="text-sm font-bold text-white sm:text-base">
        {total}
      </span>{' '}
    </div>{' '}
  </div>
);

export default QuestionCounter;
