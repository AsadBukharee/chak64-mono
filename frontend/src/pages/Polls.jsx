const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle2, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Polls() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => db.entities.Poll.filter({ is_active: true }, '-created_date'),
  });

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Polls</h1>
              <p className="text-gray-600">Your voice matters in My64 decisions</p>
            </div>
          </div>
        </Card>

        {/* Polls List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : polls.length === 0 ? (
          <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
            <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active polls at the moment</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} userEmail={user?.email} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PollCard({ poll, userEmail }) {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);

  const { data: options = [] } = useQuery({
    queryKey: ['pollOptions', poll.id],
    queryFn: () => db.entities.PollOption.filter({ poll_id: poll.id }),
  });

  const { data: userVote } = useQuery({
    queryKey: ['userVote', poll.id, userEmail],
    queryFn: () => db.entities.PollVote.filter({ poll_id: poll.id, voter_email: userEmail }),
    enabled: !!userEmail,
  });

  const hasVoted = userVote && userVote.length > 0;

  const voteMutation = useMutation({
    mutationFn: async ({ optionId }) => {
      await db.entities.PollVote.create({
        poll_id: poll.id,
        option_id: optionId,
        voter_email: userEmail,
      });
      
      const option = options.find(o => o.id === optionId);
      await db.entities.PollOption.update(optionId, {
        votes_count: (option.votes_count || 0) + 1
      });
      
      await db.entities.Poll.update(poll.id, {
        total_votes: (poll.total_votes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pollOptions', poll.id]);
      queryClient.invalidateQueries(['userVote', poll.id]);
      queryClient.invalidateQueries(['polls']);
    },
  });

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return;
    await voteMutation.mutateAsync({ optionId: selectedOption });
  };

  const totalVotes = poll.total_votes || 0;
  const daysLeft = poll.end_date ? Math.max(0, Math.ceil((new Date(poll.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
      {/* Poll Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{poll.question}</h3>
          {hasVoted && (
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Voted</span>
            </div>
          )}
        </div>
        
        {poll.description && (
          <p className="text-gray-600 mb-3">{poll.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalVotes} votes</span>
          </div>
          {daysLeft !== null && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-2 mb-4">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? ((option.votes_count || 0) / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;
          const userVotedThis = hasVoted && userVote?.[0]?.option_id === option.id;

          return (
            <div key={option.id}>
              {hasVoted ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-gray-900 font-medium ${userVotedThis ? 'text-blue-600' : ''}`}>
                      {option.option_text}
                      {userVotedThis && ' ✓'}
                    </span>
                    <span className="text-gray-700 font-bold">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-gray-200"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {option.votes_count || 0} votes
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-gray-900 font-medium">{option.option_text}</span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Vote Button */}
      {!hasVoted && (
        <Button
          onClick={handleVote}
          disabled={!selectedOption || voteMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11"
        >
          {voteMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting Vote...
            </>
          ) : (
            <>
              <Vote className="w-4 h-4 mr-2" />
              Submit Vote
            </>
          )}
        </Button>
      )}
    </Card>
  );
}