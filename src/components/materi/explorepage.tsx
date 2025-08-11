'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/backbutton/backbutton';
import UserDetail from '@/components/userinfo/userinfo';

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-3.75 5.25a3.75 3.75 0 117.5 0v3h-7.5v-3z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L10.5 12.94l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.5-4.5z"
      clipRule="evenodd"
    />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

type LevelStatus = 'locked' | 'unlocked' | 'completed';

interface Level {
  id: number;
  title: string;
  description: string;
  imgUrl: string;
  status: LevelStatus;
}

interface MasterLevel {
  id: number;
  title: string;
  description: string;
  imgUrl: string;
}

interface UserProgress {
  completedLevelIds: number[];
}

const masterLevels: MasterLevel[] = [
  {
    id: 1,
    title: 'Level 1',
    description: 'Abjad A - E',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 2,
    title: 'Level 2',
    description: 'Abjad F - J',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 3,
    title: 'Level 3',
    description: 'Kata Tanya',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 4,
    title: 'Level 4',
    description: 'Kata Sapaan',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 5,
    title: 'Level 5',
    description: 'Angka 1 - 10',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 6,
    title: 'Level 6',
    description: 'Keluarga',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 7,
    title: 'Level 7',
    description: 'Hari & Waktu',
    imgUrl: '/img/placeholder-materi.png',
  },
  {
    id: 8,
    title: 'Level 8',
    description: 'Pekerjaan',
    imgUrl: '/img/placeholder-materi.png',
  },
];

const fetchDataFromBackend = async (): Promise<{
  levels: MasterLevel[];
  progress: UserProgress;
}> => {
  const levels = masterLevels;
  const savedProgress = { completedLevelIds: [1, 2] };
  return { levels, progress: savedProgress };
};

const LevelCard = ({
  level,
  onClick,
}: {
  level: Level;
  onClick: () => void;
}) => {
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`relative w-full transform rounded-3xl p-4 text-center shadow-lg transition-all duration-300 ease-out ${
        isLocked
          ? 'cursor-not-allowed border-4 border-gray-400 bg-gray-200 opacity-70'
          : isCompleted
            ? 'border-4 border-green-400 bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 hover:-translate-y-3 hover:shadow-2xl'
            : 'border-4 border-orange-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 hover:-translate-y-3 hover:border-yellow-500 hover:shadow-2xl'
      }`}
    >
      {!isLocked && (
        <div className="absolute -left-2 -top-2 z-10">
          <div
            className={`rounded-full p-1 ${isCompleted ? 'bg-green-400' : 'bg-orange-400'}`}
          >
            <StarIcon className="size-4 text-white" />
          </div>
        </div>
      )}

      <div className="absolute -right-3 -top-3 z-20">
        {isLocked && (
          <div className="border-3 grid size-9 place-items-center rounded-full border-white bg-gray-500 shadow-md">
            <LockIcon className="size-5 text-white" />
          </div>
        )}
        {isCompleted && (
          <div className="border-3 grid size-9 place-items-center rounded-full border-white bg-green-500 shadow-md">
            <CheckCircleIcon className="size-5 text-white" />
          </div>
        )}
      </div>

      <div
        className={`flex h-full flex-col space-y-3 ${isLocked ? 'grayscale filter' : ''}`}
      >
        <h3
          className={`text-lg font-bold ${
            isLocked ? 'text-gray-600' : 'text-brand-brown-stroke'
          }`}
          style={{ fontFamily: '"Baloo 2", cursive' }}
        >
          {level.title}
        </h3>

        <div
          className={`grid flex-grow place-items-center rounded-2xl p-4 shadow-inner ${
            isLocked ? 'bg-gray-100' : 'bg-white/80'
          }`}
        >
          <img
            src={level.imgUrl}
            alt={level.description}
            className="size-16 object-contain md:size-20"
            onError={e =>
              (e.currentTarget.src =
                'https://placehold.co/80x80/f97316/ffffff?text=📚')
            }
          />
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-sm font-semibold shadow-inner ${
            isLocked
              ? 'bg-gray-200 text-gray-600'
              : 'bg-white/60 text-placeholder-brown'
          }`}
        >
          {level.description}
        </div>
      </div>
    </button>
  );
};

export default function EksplorasiPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textStrokeStyle = {
    WebkitTextStroke: '6px #CE7310',
    paintOrder: 'stroke fill',
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { levels: fetchedLevels, progress } = await fetchDataFromBackend();

      const processedLevels = fetchedLevels.map(level => {
        let status: LevelStatus = 'locked';
        const isCompleted = progress.completedLevelIds.includes(level.id);
        const highestCompleted =
          progress.completedLevelIds.length > 0
            ? Math.max(...progress.completedLevelIds)
            : 0;

        if (isCompleted) {
          status = 'completed';
        } else if (level.id === highestCompleted + 1 || level.id === 1) {
          status = 'unlocked';
        }

        return { ...level, status };
      });

      setLevels(processedLevels);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleLevelClick = (level: Level) => {
    if (level.status !== 'locked') {
      router.push(`/eksplorasi/${level.id}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      <div className="fixed inset-x-0 top-0 z-20 flex items-center p-4 md:p-6">
        <BackButton href="/onboarding" />
        <div className="mt-2 flex flex-1 justify-center md:mt-6">
          <UserDetail />
        </div>
      </div>

      <main className="relative z-10 px-4 pb-10 pt-28 md:px-8 md:pt-36">
        <div className="my-8 text-center">
          <h1
            className="text-4xl font-bold text-brand-yellow drop-shadow-lg md:text-6xl"
            style={textStrokeStyle}
          >
            Eksplorasi BISINDO
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center text-xl font-bold text-white">
            Memuat level...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
              {levels.map(level => (
                <LevelCard
                  key={level.id}
                  level={level}
                  onClick={() => handleLevelClick(level)}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="border-3 transform rounded-full border-white/90 bg-gradient-to-r from-orange-400 to-yellow-500 px-12 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:from-orange-500 hover:to-yellow-600 hover:shadow-2xl">
                Load More
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
