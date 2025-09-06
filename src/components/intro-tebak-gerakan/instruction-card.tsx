import { InstructionCardProps } from '@/types';

const InstructionCard = ({
  step,
  title,
  children,
  className = '',
}: InstructionCardProps) => (
  <div
    className={`relative rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-3 shadow-lg ${className}`}
  >
    {' '}
    <div className="absolute -top-4 left-4">
      {' '}
      <span className="rounded-full border-2 border-white bg-gradient-to-r from-orange-500 to-yellow-600 px-3 py-1.5 font-comic text-sm font-bold text-white shadow-md">
        {' '}
        {step}{' '}
      </span>{' '}
    </div>{' '}
    <div className="mt-4 flex h-full flex-col items-center justify-center text-center">
      {' '}
      <h3 className="mb-2 font-comic text-lg font-bold text-brand-brown-stroke">
        {title}
      </h3>{' '}
      {children}{' '}
    </div>{' '}
  </div>
);

export default InstructionCard;
