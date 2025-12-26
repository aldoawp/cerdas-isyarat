// @/repositories/test-scores-repository.ts

import { createClient } from '@/lib/supabase/client';

export interface ExplorationTestScore {
  score_id: string;
  user_id: string;
  exploration_id: string;
  level_number: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  attempt_number: number;
  created_at: string;
  updated_at: string;
}

export interface SaveTestScoreParams {
  userId: string;
  explorationId: string;
  levelNumber: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

/**
 * Menyimpan atau update skor tes
 * ✅ CRITICAL FIX: Keep highest score & passed status
 * - Once passed, always passed (prevent level lock)
 * - Always keep highest score
 */
export const saveTestScore = async (
  params: SaveTestScoreParams
): Promise<ExplorationTestScore> => {
  const supabase = createClient();

  const { data: existingScore, error: fetchError } = await supabase
    .from('exploration_test_scores')
    .select('*')
    .eq('user_id', params.userId)
    .eq('exploration_id', params.explorationId)
    .eq('level_number', params.levelNumber)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching existing score:', fetchError);
    throw fetchError;
  }

  if (existingScore) {
    // ✅ CRITICAL FIX: Keep highest score & passed status
    const keepHighestScore = Math.max(existingScore.score, params.score);
    const keepPassedStatus = existingScore.passed || params.passed; // Once passed, always passed

    console.log('🔄 Updating test score:', {
      oldScore: existingScore.score,
      newScore: params.score,
      finalScore: keepHighestScore,
      oldPassed: existingScore.passed,
      newPassed: params.passed,
      finalPassed: keepPassedStatus,
      reason: keepPassedStatus ? 'Level stays unlocked' : 'Still locked',
    });

    const { data, error } = await supabase
      .from('exploration_test_scores')
      .update({
        score: keepHighestScore, // ✅ Keep highest
        correct_answers:
          params.score > existingScore.score
            ? params.correctAnswers
            : existingScore.correct_answers,
        total_questions: params.totalQuestions,
        passed: keepPassedStatus, // ✅ Once passed, always passed
        attempt_number: existingScore.attempt_number + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('score_id', existingScore.score_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating test score:', error);
      throw error;
    }

    console.log(
      `✅ Score updated: ${keepHighestScore}%, Passed: ${keepPassedStatus}`
    );
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('exploration_test_scores')
      .insert({
        user_id: params.userId,
        exploration_id: params.explorationId,
        level_number: params.levelNumber,
        score: params.score,
        correct_answers: params.correctAnswers,
        total_questions: params.totalQuestions,
        passed: params.passed,
        attempt_number: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting test score:', error);
      throw error;
    }

    console.log(
      `✨ New score recorded: ${params.score}%, Passed: ${params.passed}`
    );
    return data;
  }
};

/**
 * Mendapatkan skor tes untuk level tertentu
 */
export const getTestScoreForLevel = async (
  userId: string,
  explorationId: string,
  levelNumber: number
): Promise<ExplorationTestScore | undefined> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_test_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('exploration_id', explorationId)
    .eq('level_number', levelNumber)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching test score:', error);
    throw error;
  }

  return data || undefined;
};

/**
 * Mendapatkan semua skor tes user
 */
export const getAllTestScores = async (
  userId: string
): Promise<ExplorationTestScore[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_test_scores')
    .select('*')
    .eq('user_id', userId)
    .order('level_number', { ascending: true });

  if (error) {
    console.error('Error fetching all test scores:', error);
    throw error;
  }

  return data || [];
};

/**
 * Mendapatkan level tertinggi yang sudah lulus (passed = true)
 */
export const getHighestPassedLevel = async (
  userId: string
): Promise<number> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_test_scores')
    .select('level_number')
    .eq('user_id', userId)
    .eq('passed', true)
    .order('level_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching highest passed level:', error);
    throw error;
  }

  return data?.level_number || 0;
};

/**
 * Cek apakah user sudah pernah lulus level tertentu
 */
export const hasPassedLevel = async (
  userId: string,
  explorationId: string,
  levelNumber: number
): Promise<boolean> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_test_scores')
    .select('passed')
    .eq('user_id', userId)
    .eq('exploration_id', explorationId)
    .eq('level_number', levelNumber)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking passed level:', error);
    throw error;
  }

  return data?.passed || false;
};

/**
 * Get test scores by exploration ID
 */
export const getTestScoresByExploration = async (
  userId: string,
  explorationId: string
): Promise<ExplorationTestScore[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_test_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('exploration_id', explorationId)
    .order('level_number', { ascending: true });

  if (error) {
    console.error('Error fetching exploration test scores:', error);
    throw error;
  }

  return data || [];
};

/**
 * Delete all test scores for a user (admin/testing purpose)
 */
export const deleteAllUserTestScores = async (
  userId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('exploration_test_scores')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting test scores:', error);
    throw error;
  }
};
