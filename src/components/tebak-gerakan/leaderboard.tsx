'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getLeaderboard,
  type LeaderboardEntry,
} from '@/services/tebak-gerakan-service';
import { getDisplayName } from '@/lib/utils/name-utils';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-spin rounded-full border-4 border-orange-300 border-t-orange-600 ${className}`}
  />
);

const MedalIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <span className="text-3xl drop-shadow-md">🥇</span>;
  if (rank === 2) return <span className="text-3xl drop-shadow-md">🥈</span>;
  if (rank === 3) return <span className="text-3xl drop-shadow-md">🥉</span>;
  return undefined;
};

// Background gradient berbeda untuk Top 3
const getRankStyle = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser)
    return 'border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200';
  if (rank === 1)
    return 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-100 shadow-md';
  if (rank === 2)
    return 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-200 shadow-md';
  if (rank === 3)
    return 'border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md';
  return 'border-orange-200 bg-white/80';
};

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(undefined);

      getLeaderboard(10)
        .then(setLeaderboard)
        .catch(error_ => {
          // eslint-disable-next-line no-console
          console.error('Failed to load leaderboard:', error_);
          setError('Gagal memuat peringkat');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return undefined;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border-4 border-yellow-400 bg-[#FFFBEB] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-yellow-400 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🏆</span>
            <h2 className="font-comic text-3xl font-bold text-white drop-shadow-md text-stroke-sm">
              PERINGKAT
            </h2>
            <span className="text-3xl">🏆</span>
          </div>
          <p className="font-comic text-sm font-bold text-white/90">
            Top 10 Pemain Terbaik
          </p>
        </div>

        {/* Content List (Scrollable) */}
        <div className="max-h-[60vh] overflow-y-auto p-4 md:max-h-96">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10">
              <LoadingSpinner className="mb-2 size-10" />
              <p className="font-comic text-xs text-gray-500">Memuat data...</p>
            </div>
          )}

          {error && (
            <div className="py-10 text-center">
              <p className="font-comic text-sm text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="py-10 text-center">
              <p className="font-comic text-sm text-gray-500">
                Belum ada data.
              </p>
            </div>
          )}

          {!loading && !error && leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map(entry => {
                const isCurrentUser = entry.user_id === currentUserId;
                const displayName = getDisplayName(entry.full_name); // Pakai nama pendek

                return (
                  <div
                    key={entry.score_id}
                    className={`flex items-center gap-3 rounded-xl border-2 p-2 pr-4 transition-transform ${getRankStyle(
                      entry.rank,
                      isCurrentUser
                    )}`}
                  >
                    {/* Rank Circle */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white font-comic text-sm font-bold text-gray-700 shadow-sm">
                      {entry.rank}
                    </div>

                    {/* Avatar */}
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-yellow-100 shadow-sm">
                      {entry.avatar_url ? (
                        <Image
                          src={entry.avatar_url}
                          alt={displayName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-comic text-xs font-bold text-gray-400">
                          ?
                        </div>
                      )}
                    </div>

                    {/* Name & Badge */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate font-comic text-sm font-bold text-gray-800">
                          {displayName}
                        </p>
                        {isCurrentUser && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                            Kamu
                          </span>
                        )}
                      </div>
                      <p className="font-comic text-[10px] text-gray-500">
                        {entry.correct_answers} Benar
                      </p>
                    </div>

                    {/* Score / Medal */}
                    <div className="flex flex-col items-center justify-center">
                      {entry.rank <= 3 ? (
                        <MedalIcon rank={entry.rank} />
                      ) : undefined}
                      <p className="font-comic text-xs font-bold text-orange-600">
                        {entry.score} poin
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="border-t-2 border-orange-100 bg-white p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-orange-500 py-3 font-comic text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-orange-600 active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
