import { createClient } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  score_id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | undefined; // Changed from null
  score: number;
  correct_answers: number;
  total_questions: number;
  rank: number;
  created_at: string;
}

export interface SaveScoreParams {
  userId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  gameDuration?: number;
}

/**
 * Simpan skor game (HANYA UPDATE JIKA HIGH SCORE)
 */
export const saveGameScore = async (params: SaveScoreParams): Promise<void> => {
  const supabase = createClient();

  // 1. Cek skor yang sudah ada untuk user ini
  const { data: existingScore, error: fetchError } = await supabase
    .from('game_scores')
    .select('score, score_id')
    .eq('user_id', params.userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Error selain "data not found"

    console.error('Error checking existing score:', fetchError);
    return;
  }

  // 2. Logika Update atau Insert
  if (existingScore) {
    // Jika skor baru LEBIH BESAR dari skor lama, lakukan UPDATE
    if (params.score > existingScore.score) {
      const { error: updateError } = await supabase
        .from('game_scores')
        .update({
          score: params.score,
          correct_answers: params.correctAnswers,
          total_questions: params.totalQuestions,
          game_duration: params.gameDuration,
          updated_at: new Date().toISOString(), // Pastikan ada kolom updated_at atau hapus baris ini
        })
        .eq('user_id', params.userId);

      if (updateError) throw new Error('Gagal update high score');
    }
    // Jika skor baru lebih kecil/sama, tidak perlu update database
  } else {
    // Jika belum ada data sama sekali, lakukan INSERT
    const { error: insertError } = await supabase.from('game_scores').insert({
      user_id: params.userId,
      score: params.score,
      correct_answers: params.correctAnswers,
      total_questions: params.totalQuestions,
      game_duration: params.gameDuration,
    });

    if (insertError) throw new Error('Gagal insert skor baru');
  }
};

/**
 * Ambil leaderboard (Top N Players)
 */
export const getLeaderboard = async (
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_scores')
    .select(
      `
      score_id,
      user_id,
      score,
      correct_answers,
      total_questions,
      created_at,
      users!inner (
        full_name,
        avatar_id,
        avatars (
          assets (
            url
          )
        )
      )
    `
    )
    .order('score', { ascending: false }) // Urutkan dari skor tertinggi
    .order('created_at', { ascending: true }) // Jika seri, yang main duluan di atas
    .limit(limit);

  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }

  return data.map((item: any, index: number) => ({
    score_id: item.score_id,
    user_id: item.user_id,
    full_name: item.users?.full_name || 'Unknown',
    avatar_url: item.users?.avatars?.assets?.url || undefined, // Changed from null
    score: item.score,
    correct_answers: item.correct_answers,
    total_questions: item.total_questions,
    rank: index + 1,
    created_at: item.created_at,
  }));
};

/**
 * Ambil Ranking User Saat Ini
 */
export const getUserRank = async (
  userId: string
): Promise<number | undefined> => {
  // Changed return type
  const supabase = createClient();

  // Ambil skor user saat ini
  const { data: userScore } = await supabase
    .from('game_scores')
    .select('score')
    .eq('user_id', userId)
    .single();

  if (!userScore) return undefined; // Changed from null

  // Hitung berapa orang yang skornya LEBIH TINGGI
  const { count } = await supabase
    .from('game_scores')
    .select('*', { count: 'exact', head: true })
    .gt('score', userScore.score);

  return (count || 0) + 1;
};

export const getUserHighScore = async (userId: string): Promise<number> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_scores')
    .select('score')
    .eq('user_id', userId)
    .single(); // Karena kita update row (bukan insert baru), cukup single()

  if (error || !data) {
    return 0;
  }

  return data.score;
};
