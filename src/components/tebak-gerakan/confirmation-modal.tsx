const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return <></>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {' '}
      <div className="relative w-full max-w-sm animate-jump-in">
        {' '}
        <div className="relative z-10 rounded-3xl border-4 border-red-300 bg-gradient-to-br from-red-100 to-red-200 p-6 text-center shadow-lg">
          {' '}
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500">
            {' '}
            <svg
              className="size-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {' '}
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />{' '}
            </svg>{' '}
          </div>{' '}
          <h3 className="mb-2 font-comic text-2xl font-bold text-red-700">
            Yakin mau keluar?
          </h3>{' '}
          <p className="mb-6 text-red-600">
            Semua progress tes kamu akan hilang.
          </p>{' '}
          <div className="flex gap-4">
            {' '}
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl bg-gray-300 px-4 py-3 font-comic font-bold text-gray-700 shadow-md transition-all hover:scale-105 hover:bg-gray-400"
            >
              {' '}
              Batal{' '}
            </button>{' '}
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-comic font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-red-600"
            >
              {' '}
              Ya, Keluar{' '}
            </button>{' '}
          </div>{' '}
        </div>{' '}
        <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-red-400"></div>{' '}
      </div>{' '}
    </div>
  );
};

export default ConfirmationModal;
