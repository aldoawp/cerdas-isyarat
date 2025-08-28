const FunModal = ({
  isOpen,
  onAction,
  title,
  message,
  buttonText,
  icon,
}: {
  isOpen: boolean;
  onAction: () => void;
  title: string;
  message: string;
  buttonText: string;
  icon: string;
}) => {
  if (!isOpen) return <></>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {' '}
      <div className="relative w-full max-w-md animate-jump-in">
        {' '}
        <div className="relative z-10 rounded-3xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-100 to-orange-200 p-6 text-center shadow-lg">
          {' '}
          <div className="mb-4 animate-bounce text-6xl">{icon}</div>{' '}
          <h3 className="mb-3 font-comic text-3xl font-bold text-orange-600 drop-shadow-md">
            {title}
          </h3>{' '}
          <p className="mb-6 text-lg text-orange-800">{message}</p>{' '}
          <button
            onClick={onAction}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-500 p-4 font-comic text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-orange-500 hover:to-yellow-600"
          >
            {' '}
            {buttonText}{' '}
          </button>{' '}
        </div>{' '}
        <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-yellow-400"></div>{' '}
      </div>{' '}
    </div>
  );
};

export default FunModal;
