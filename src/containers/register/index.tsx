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
import SuccessModal from '@/components/register/success-modal';
import ErrorModal from '@/components/register/error-modal';
import { FormDataState, FormErrors } from '@/types/forms';
import { useProtectedRoute, usePageLoading } from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';
import { createClient } from '@/lib/supabase/client';

type RegisterPageProps = {
  onRegister?: (form: FormDataState) => Promise<unknown>;
};

const checkUserDuplicates = async (email: string, username: string) => {
  const supabase = createClient();

  // Check if email or username already exists
  const { data, error } = await supabase
    .from('users')
    .select('email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(2);

  if (error) throw error;

  const existingEmail = data?.find(user => user.email === email);
  const existingUsername = data?.find(user => user.username === username);

  return {
    emailExists: !!existingEmail,
    usernameExists: !!existingUsername,
    existingEmail: existingEmail?.email,
    existingUsername: existingUsername?.username,
  };
};

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const router = useRouter();
  const { loading: authLoading } = useProtectedRoute();
  const { isPageLoading } = usePageLoading();

  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    age: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]{4,}$/;

    if (!formData.fullName)
      newErrors.fullName = 'Nama lengkap tidak boleh kosong, ya!';
    if (!formData.age) newErrors.age = 'Umurnya berapa, nih?';

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email-nya jangan lupa diisi, ya!';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid, nih. Contoh: nama@email.com';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username-nya jangan lupa diisi.';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username =
        'Username harus minimal 4 karakter dan hanya boleh huruf dan angka, ya!';
    }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (!isFormValid) {
      setIsShaking(true);
      return;
    }

    // Check for duplicates before proceeding with registration
    setIsCheckingDuplicates(true);
    try {
      const duplicateCheck = await checkUserDuplicates(
        formData.email,
        formData.username
      );

      if (duplicateCheck.emailExists || duplicateCheck.usernameExists) {
        let errorMsg = '';
        if (duplicateCheck.emailExists && duplicateCheck.usernameExists) {
          errorMsg =
            'Email dan username sudah digunakan. Silakan gunakan email dan username yang berbeda.';
        } else if (duplicateCheck.emailExists) {
          errorMsg =
            'Email sudah digunakan. Silakan gunakan email yang berbeda.';
        } else if (duplicateCheck.usernameExists) {
          errorMsg =
            'Username sudah digunakan. Silakan gunakan username yang berbeda.';
        }
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        setIsCheckingDuplicates(false);
        return;
      }

      // If no duplicates found, proceed with registration
      if (onRegister) {
        await onRegister(formData);
      }
      setShowSuccessModal(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registrasi gagal.';
      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsCheckingDuplicates(false);
    }
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

  // Show loading screen while page is loading or checking authentication
  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  const formFields: {
    name: keyof FormDataState;
    placeholder: string;
    type: string;
  }[] = [
    { name: 'fullName', placeholder: 'Nama lengkap', type: 'text' },
    { name: 'age', placeholder: 'Umur', type: 'number' },
    { name: 'email', placeholder: 'Email', type: 'text' },
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
    <UserIcon key="nama" className="size-5 text-white md:size-6" />,
    <UserIcon key="user" className="size-5 text-white md:size-6" />,
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

      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Oops! Ada Masalah"
          message={errorMessage}
          mascotSrc="/images/mascot-cropped-1-tp 1.png"
        />
      )}

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mobile-bg bg-cover bg-center p-12 font-sans md:bg-desktop-bg">
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
                  disabled={isCheckingDuplicates}
                  className={`w-3/4 rounded-[15px] border-4 border-brand-brown-stroke bg-amber-500 py-2 font-comic text-lg font-bold text-white transition duration-300 hover:bg-yellow-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${isShaking ? 'animate-shake' : ''}`}
                >
                  {isCheckingDuplicates ? 'MEMERIKSA...' : 'BUAT AKUN'}
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
