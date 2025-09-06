import Image from 'next/image';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  mascotSrc: string;
}

const ErrorModal = ({
  isOpen,
  onClose,
  title,
  message,
  mascotSrc,
}: ErrorModalProps) => {
  if (!isOpen) return undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative mx-auto max-w-sm animate-jump-in rounded-3xl border-4 border-red-300 bg-form-bg p-6 text-center shadow-lg transition-all">
        <Image
          src={mascotSrc}
          alt="Mascot"
          width={128}
          height={128}
          className="mx-auto -mt-20 mb-2 h-auto w-32"
        />
        <h3 className="mb-2 font-comic text-2xl font-bold text-red-600">
          {title}
        </h3>
        <p className="mb-6 px-4 font-comic text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-red-500 py-3 text-lg font-bold text-white shadow-md transition duration-300 hover:bg-red-600"
        >
          OK, Coba Lagi
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
