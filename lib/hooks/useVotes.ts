'use client';

import { useState, useEffect } from 'react';
import { Timestamp, doc, orderBy, deleteDoc, setDoc } from 'firebase/firestore';
import { Vote, VoteFormData, VoteResult } from '@/types/vote';
import {
  getVotesRef,
  addDocument,
  subscribeToCollection,
} from '@/lib/firebase/firestore';

export const useVotes = (groupId: string) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const votesRef = getVotesRef(groupId);
    const unsubscribe = subscribeToCollection(
      votesRef,
      (data) => {
        setVotes(data as Vote[]);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, [groupId]);

  return { votes, loading };
};

export const useVoteActions = (groupId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVote = async (formData: VoteFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const votesRef = getVotesRef(groupId);
      const voteData = {
        question: formData.question,
        options: formData.options,
        votes: formData.options.reduce((acc, option) => {
          acc[option] = [];
          return acc;
        }, {} as Record<string, string[]>),
        createdBy: formData.createdBy,
        expiresAt: formData.expiresAt ? Timestamp.fromDate(formData.expiresAt) : null,
        allowMultiple: formData.allowMultiple,
      };

      const voteId = await addDocument(votesRef, voteData);
      setLoading(false);
      return voteId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '투표 생성 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const castVote = async (
    voteId: string,
    option: string,
    voterName: string,
    currentVote: Vote
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const voteRef = doc(getVotesRef(groupId), voteId);
      const newVotes = { ...currentVote.votes };

      // 단일 선택인 경우 기존 투표 제거
      if (!currentVote.allowMultiple) {
        Object.keys(newVotes).forEach((key) => {
          newVotes[key] = newVotes[key].filter((v) => v !== voterName);
        });
      }

      // 이미 해당 옵션에 투표했으면 취소, 아니면 추가
      if (newVotes[option].includes(voterName)) {
        newVotes[option] = newVotes[option].filter((v) => v !== voterName);
      } else {
        newVotes[option] = [...newVotes[option], voterName];
      }

      await setDoc(voteRef, { votes: newVotes }, { merge: true });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '투표 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteVote = async (voteId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const voteRef = doc(getVotesRef(groupId), voteId);
      await deleteDoc(voteRef);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '투표 삭제 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    loading,
    error,
    createVote,
    castVote,
    deleteVote,
  };
};

// 투표 결과 계산
export const calculateVoteResults = (vote: Vote): VoteResult[] => {
  const totalVoters = new Set(
    Object.values(vote.votes).flat()
  ).size;

  return vote.options.map((option) => {
    const voters = vote.votes[option] || [];
    const count = voters.length;
    const percentage = totalVoters > 0 ? (count / totalVoters) * 100 : 0;

    return {
      option,
      count,
      voters,
      percentage,
    };
  });
};
