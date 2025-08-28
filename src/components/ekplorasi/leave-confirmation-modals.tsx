'use client';

export const LeaveConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="m-4 w-full max-w-md animate-jump-in rounded-3xl bg-form-bg p-6 text-center shadow-2xl drop-shadow-comic">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-4 text-3xl font-bold text-brand-brown-stroke">
          Tunggu Dulu!
        </h2>
        <p className="mb-6 text-lg font-medium text-placeholder-brown">
          Kalau kamu keluar sekarang, kamu akan kehilangan 1 nyawa dan harus
          mengulang dari awal. Yakin mau keluar?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-300 py-3 font-bold text-gray-700 shadow-lg transition-all hover:scale-105"
          >
            {' '}
            <span className="text-xl">🚫</span> <span>Batal</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-icon-red-bg py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
          >
            {' '}
            <span className="text-xl">👋</span> <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
