'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '../backbutton/backbutton';

// Tipe data untuk state form
interface FormDataState {
  fullName: string;
  age: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Tipe data untuk state error
type FormErrors = {
  [key in keyof FormDataState]?: string;
};

// Tipe data untuk objek pengguna
interface User {
  fullName: string;
  age: string;
  username: string;
  password: string;
}

// --- KOMPONEN IKON ---
const EyeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const EyeClosedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
    />
  </svg>
);

// Komponen Modal untuk notifikasi sukses
const SuccessModal = ({
  onClose,
  mascotSrc,
}: {
  onClose: () => void;
  mascotSrc: string;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
    <div className="animate-jump-in relative mx-auto max-w-sm rounded-3xl border-4 border-brand-yellow bg-form-bg p-6 text-center shadow-lg transition-all">
      <img
        src={mascotSrc}
        alt="Mascot"
        className="mx-auto -mt-20 mb-2 h-auto w-32"
      />
      <h3
        className="mb-2 text-2xl font-bold text-brand-brown-stroke"
        style={{ fontFamily: '"Baloo 2", cursive' }}
      >
        Hore! Berhasil!
      </h3>
      <p
        className="mb-6 px-4 text-gray-700"
        style={{ fontFamily: '"Comic Sans MS", cursive' }}
      >
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

// Komponen utama untuk halaman registrasi
export default function RegisterPage() {
  const textStrokeStyle = {
    WebkitTextStroke: '6px #CE7310',
    paintOrder: 'stroke fill',
  };

  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    age: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  // Fungsi validasi form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!formData.fullName)
      newErrors.fullName = 'Nama lengkap tidak boleh kosong, ya!';
    if (!formData.age) newErrors.age = 'Umurnya berapa, nih?';
    if (!formData.username)
      newErrors.username = 'Username-nya jangan lupa diisi.';

    if (!formData.password) {
      newErrors.password = 'Passwordnya rahasia, tapi harus diisi!';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password harus minimal 6 karakter, ada huruf dan angkanya, ya!';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Ketik ulang passwordnya di sini, ya.';
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwordnya harus sama dengan yang di atas, nih.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi yang dijalankan saat form disubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isFormValid = validateForm();

    if (!isFormValid) {
      setIsShaking(true);
      return;
    }

    const existingUsersRaw = localStorage.getItem('users');
    const existingUsers: User[] = existingUsersRaw
      ? JSON.parse(existingUsersRaw)
      : [];
    const isUsernameTaken = existingUsers.some(
      user => user.username.toLowerCase() === formData.username.toLowerCase()
    );

    if (isUsernameTaken) {
      setErrors(prev => ({
        ...prev,
        username: 'Username ini sudah dipakai, coba yang lain, yuk!',
      }));
      setIsShaking(true);
      return;
    }

    const newUser: User = {
      fullName: formData.fullName,
      age: formData.age,
      username: formData.username,
      password: formData.password,
    };
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setShowSuccessModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    if (errors[name as keyof FormDataState]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  const formFields: {
    name: keyof FormDataState;
    placeholder: string;
    type: string;
  }[] = [
    { name: 'fullName', placeholder: 'Nama lengkap', type: 'text' },
    { name: 'age', placeholder: 'Umur', type: 'number' },
    { name: 'username', placeholder: 'Username', type: 'text' },
    { name: 'password', placeholder: 'Password', type: 'password' },
    {
      name: 'confirmPassword',
      placeholder: 'Konfirmasi password',
      type: 'password',
    },
  ];

  const icons = [
    <svg
      key="nama"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>,
    <svg
      key="umur"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V12a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
        clipRule="evenodd"
      />
    </svg>,
    <svg
      key="user"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
      />
    </svg>,
    <svg
      key="pass"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>,
    <svg
      key="konfirm"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>,
  ];
  const iconBgs = [
    'bg-icon-orange-bg',
    'bg-icon-green-bg',
    'bg-icon-red-bg',
    'bg-icon-teal-bg',
    'bg-icon-teal-bg',
  ];

  return (
    <>
      <style>{`
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .shake { animation: shake 0.5s ease-in-out; }
        @keyframes jump-in { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
        .animate-jump-in { animation: jump-in 0.3s ease-out forwards; }
      `}</style>

      {showSuccessModal && (
        <SuccessModal
          mascotSrc="/img/mascot-cropped-1-tp 1.png"
          onClose={() => {
            setShowSuccessModal(false);
            globalThis.location.href = '/login';
          }}
        />
      )}

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mobile-bg bg-cover bg-center p-4 font-sans md:bg-desktop-bg">
        {/* --- TOMBOL KEMBALI MENGGUNAKAN KOMPONEN --- */}
        <BackButton href="/login" />

        <main className="z-10 w-full max-w-4xl">
          <div className="mb-16 text-center">
            <h1
              className="text-5xl font-bold text-brand-yellow drop-shadow-lg md:text-7xl"
              style={textStrokeStyle}
            >
              CerdasIsyarat
            </h1>
            <h2
              className="mt-2 whitespace-nowrap text-xl font-bold text-subtitle-cream drop-shadow-lg sm:text-2xl md:text-3xl lg:text-4xl"
              style={textStrokeStyle}
            >
              Belajar Bahasa Isyarat Asik
            </h2>
          </div>

          <div className="relative w-full rounded-3xl bg-form-bg p-8 shadow-lg">
            <div className="absolute left-1/2 top-0 w-full -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="inline-block w-3/4 rounded-[24px] bg-[#F59E0B] py-4 text-2xl font-bold text-white shadow-lg md:text-3xl">
                DAFTAR
              </span>
            </div>

            <form className="mt-12" onSubmit={handleSubmit} noValidate>
              <div className="space-y-3">
                {formFields.map((field, index) => {
                  const isPasswordField = field.type === 'password';
                  const fieldName =
                    field.name as keyof typeof passwordVisibility;

                  return (
                    <div key={field.name}>
                      <div className="relative flex items-center">
                        <div
                          className={`absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg md:size-9 ${iconBgs[index % 5]}`}
                        >
                          {icons[index % 5]}
                        </div>
                        <input
                          type={
                            isPasswordField
                              ? passwordVisibility[fieldName]
                                ? 'text'
                                : 'password'
                              : field.type
                          }
                          name={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name as keyof FormDataState]}
                          onChange={handleChange}
                          className={`h-12 w-full rounded-[20px] border-4 bg-input-bg p-2 pl-12 text-sm text-brand-brown-stroke transition-colors placeholder:text-placeholder-brown focus:outline-none md:h-14 md:text-base ${errors[field.name as keyof FormDataState] ? 'border-red-500' : 'border-input-border'}`}
                          style={{ fontFamily: '"Comic Sans MS", cursive' }}
                        />
                        {isPasswordField && (
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                            onClick={() =>
                              setPasswordVisibility(prev => ({
                                ...prev,
                                [fieldName]: !prev[fieldName],
                              }))
                            }
                          >
                            {passwordVisibility[fieldName] ? (
                              <EyeOpenIcon className="size-6" />
                            ) : (
                              <EyeClosedIcon className="size-6" />
                            )}
                          </button>
                        )}
                      </div>
                      {errors[field.name as keyof FormDataState] && (
                        <p className="ml-2 mt-1 text-xs font-semibold text-red-600">
                          {errors[field.name as keyof FormDataState]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <button
                  type="submit"
                  className={`w-3/4 rounded-[15px] bg-[#F59E0B] py-2 text-lg font-bold text-white transition duration-300 hover:bg-yellow-600 ${isShaking ? 'shake' : ''}`}
                >
                  BUAT AKUN
                </button>
              </div>
            </form>
          </div>
        </main>

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-36 md:w-52 lg:w-64 xl:w-72">
          <img
            src="/img/mascot-cropped-1-tp 1.png"
            alt="Mascot Cerdas Isyarat"
            className="h-auto w-full"
          />
        </div>
      </div>
    </>
  );
}
