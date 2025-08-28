'use client';

import React, { useState, useEffect } from 'react';
import {
  EyeOpenIcon,
  EyeClosedIcon,
  UserIcon,
  LockIcon,
} from '@/components/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// --- TIPE DATA & INTERFACE ---
interface FormDataState {
  fullName: string;
  age: string;
  username: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = {
  [key in keyof FormDataState]?: string;
};

interface User {
  fullName: string;
  age: string;
  username: string;
  password: string;
}

// Komponen Modal untuk notifikasi sukses
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

// Komponen utama untuk halaman registrasi
export default function RegisterPage() {
  const router = useRouter();

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
    <UserIcon key="nama" className="size-5 text-white md:size-6" />,
    <svg
      key="umur"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 text-white md:size-6"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      {' '}
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V12a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
        clipRule="evenodd"
      />{' '}
    </svg>,
    <UserIcon key="user" className="size-5 text-white md:size-6" />,
    <LockIcon key="pass" className="size-5 text-white md:size-6" />,
    <LockIcon key="konfirm" className="size-5 text-white md:size-6" />,
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
      {showSuccessModal && (
        <SuccessModal
          mascotSrc="/images/mascot-cropped-1-tp 1.png"
          onClose={() => {
            setShowSuccessModal(false);
            router.push('/login');
          }}
        />
      )}

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mobile-bg bg-cover bg-center p-4 font-sans md:bg-desktop-bg">
        <Link
          href="/login"
          className="absolute left-4 top-4 z-20 grid size-12 place-items-center rounded-full border-2 border-yellow-400/80 bg-form-bg/90 text-brand-yellow shadow-lg transition-transform hover:scale-110 md:left-6 md:top-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-6"
          >
            {' '}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />{' '}
          </svg>
        </Link>

        <main className="z-10 w-full max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-7xl">
              CerdasIsyarat
            </h1>
            <h2 className="mt-2 whitespace-nowrap text-xl font-bold text-subtitle-cream drop-shadow-lg text-stroke sm:text-2xl md:text-3xl lg:text-4xl">
              Belajar Bahasa Isyarat Asik
            </h2>
          </div>

          <div className="relative w-full rounded-3xl border-4 border-brand-brown-stroke bg-form-bg p-8 shadow-lg">
            <div className="absolute left-1/2 top-0 w-full -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="inline-block w-3/4 rounded-[24px] border-4 border-brand-brown-stroke bg-amber-500 py-4 text-2xl font-bold text-white shadow-lg md:text-3xl">
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
                          // [DIPERBAIKI] Tanda kurung ditambahkan di sini
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
                          className={`h-12 w-full rounded-[20px] border-4 bg-input-bg p-2 pl-12 font-comic text-sm font-bold text-brand-brown-stroke transition-colors placeholder:text-placeholder-brown focus:outline-none focus:ring-2 focus:ring-amber-500 md:h-14 md:text-base ${errors[field.name as keyof FormDataState] ? 'border-red-500' : 'border-input-border'}`}
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
                  className={`w-3/4 rounded-[15px] border-4 border-brand-brown-stroke bg-amber-500 py-2 font-comic text-lg font-bold text-white transition duration-300 hover:bg-yellow-600 active:scale-95 ${isShaking ? 'animate-shake' : ''}`}
                >
                  BUAT AKUN
                </button>
              </div>
            </form>
          </div>
        </main>

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-36 md:w-52 lg:w-64 xl:w-72">
          <Image
            src="/images/mascot-cropped-1-tp 1.png"
            alt="Mascot Cerdas Isyarat"
            width={288}
            height={350}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </>
  );
}
