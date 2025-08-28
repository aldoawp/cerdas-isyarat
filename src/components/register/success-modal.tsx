import Image from 'next/image';

const SuccessModal = ({
  onClose,
  mascotSrc,
}: {
  onClose: () => void;
  mascotSrc: string;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
    <div className="relative mx-auto max-w-sm animate-jump-in rounded-3xl border-4 border-brand-yellow bg-form-bg p-6 text-center shadow-lg transition-all">
      <Image
        src={mascotSrc}
        alt="Mascot"
        width={128}
        height={128}
        className="mx-auto -mt-20 mb-2 h-auto w-32"
      />
      <h3 className="mb-2 font-comic text-2xl font-bold text-brand-brown-stroke">
        Hore! Berhasil!
      </h3>
      <p className="mb-6 px-4 font-comic text-gray-700">
        Akunmu sudah jadi. Sebentar lagi kamu akan diarahkan ke halaman login,
        ya!
      </p>
      <button
        onClick={onClose}
        className="w-full rounded-xl bg-[#F59E0B] py-3 text-lg font-bold text-white shadow-md transition duration-300 hover:bg-yellow-600"
      >
        OK!
      </button>
    </div>
  </div>
);

export default SuccessModal;
