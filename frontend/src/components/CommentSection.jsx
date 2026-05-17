const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Reply, Smile, Image as ImageIcon, Mic, Send, Loader2, X, BadgeCheck } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

const EMOJI_LIST = [
  '😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘',
  '😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥳','😏','😒',
  '😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡',
  '🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥',
  '😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵',
  '🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','👍','👎','👏','🙌','🤝',
  '🙏','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯'
];

export default function CommentSection({ postId, currentUser }) {
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionStart, setMentionStart] = useState(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => db.entities.Comment.filter({ post_id: postId }, '-created_date'),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => db.entities.User.list(),
    enabled: showMentions,
  });

  // Fetch all users for verified badge lookup
  const { data: usersForBadge = [] } = useQuery({
    queryKey: ['all-users-badge'],
    queryFn: () => db.entities.User.list(),
  });

  // Build a map of email -> is_verified for quick lookup
  const verifiedMap = {};
  usersForBadge.forEach(u => {
    if (u.email) verifiedMap[u.email] = !!u.is_verified;
  });

  const filteredMentions = allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => db.entities.Comment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['commentsCount', postId]);
      setCommentText("");
      setReplyingTo(null);
      setSelectedMedia(null);
    },
  });

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setSelectedMedia({ url: file_url, type: file.type.startsWith('image/') ? 'image' : 'video' });
    setIsUploading(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setCommentText(val);
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const before = commentText.slice(0, mentionStart);
    const after = commentText.slice(inputRef.current.selectionStart);
    setCommentText(before + `@${user.full_name} ` + after);
    setShowMentions(false);
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) mentions.push(match[1]);
    return mentions;
  };

  const handleAddComment = async () => {
    if (!commentText.trim() && !selectedMedia) return;
    await createCommentMutation.mutateAsync({
      post_id: postId,
      content: commentText,
      author_name: currentUser.full_name,
      author_email: currentUser.email,
      parent_comment_id: replyingTo?.id || null,
      media_url: selectedMedia?.url || "",
      media_type: selectedMedia?.type || "none",
      mentioned_users: extractMentions(commentText),
    });
  };

  // FIX: Use String() comparison to avoid type mismatch (string vs number)
  const rootComments = comments.filter(c => !c.parent_comment_id || c.parent_comment_id === "null");

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      {/* Add Comment */}
      <div className="space-y-2">
        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm text-blue-700">
              {t('feed.replyingTo')} <strong>{replyingTo.author_name}</strong>
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-blue-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectedMedia && (
          <div className="relative bg-gray-50 rounded-lg p-2">
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.url} alt="Preview" className="w-full h-32 object-cover rounded" />
            ) : (
              <video src={selectedMedia.url} className="w-full h-32 object-cover rounded" controls />
            )}
            <button onClick={() => setSelectedMedia(null)} className="absolute top-3 right-3 bg-white p-1 rounded-full shadow">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={t('feed.writeComment')}
              value={commentText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
              className="border-gray-200 focus:border-blue-500 rounded-full pr-28"
            />

            {/* Mention suggestions */}
            {showMentions && filteredMentions.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 max-h-40 overflow-y-auto">
                {filteredMentions.map(u => (
                  <button key={u.id} onMouseDown={() => insertMention(u)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {u.full_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-800">{u.full_name}</span>
                    {u.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload}
                className="hidden" id={`media-${postId}`} disabled={isUploading} />
              <label htmlFor={`media-${postId}`}>
                <Button type="button" variant="ghost" size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600" disabled={isUploading} asChild>
                  <span className="cursor-pointer">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  </span>
                </Button>
              </label>

              {/* Emoji Picker */}
              <div className="relative" ref={emojiRef}>
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600">
                  <Smile className="w-4 h-4" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2"
                    style={{ width: '240px', height: '200px', overflowY: 'auto' }}>
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJI_LIST.map((emoji, index) => (
                        <button key={index}
                          onClick={() => { setCommentText(commentText + emoji); setShowEmojiPicker(false); }}
                          className="text-xl hover:bg-gray-100 rounded p-0.5 transition-colors leading-none w-7 h-7 flex items-center justify-center">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleAddComment}
            disabled={(!commentText.trim() && !selectedMedia) || createCommentMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
            {createCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {rootComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} allComments={comments}
            currentUser={currentUser} onReply={setReplyingTo} verifiedMap={verifiedMap} />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment, allComments, currentUser, onReply, isReply = false, verifiedMap = {} }) {
  // FIX: Convert both sides to String for reliable comparison
  const replies = allComments.filter(c => c.parent_comment_id && String(c.parent_comment_id) === String(comment.id));
  const { t } = useTranslation();
  const isVerified = verifiedMap[comment.author_email];

  const navigateToProfile = (email) => {
    window.location.href = `/Profile?user=${email}`;
  };

  const renderContent = (text) => {
    if (!text) return null;
    return text.split(/(@\S+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-600 font-medium cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`${isReply ? 'ml-8' : ''}`}>
      <div className="flex gap-2 bg-gray-50 p-3 rounded-lg">
        <button onClick={() => navigateToProfile(comment.author_email)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hover:opacity-80">
          {comment.author_name?.[0]?.toUpperCase()}
        </button>
        <div className="flex-1">
          <div className="bg-white p-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => navigateToProfile(comment.author_email)}
                className="text-gray-900 font-medium text-sm hover:text-blue-600 hover:underline">
                {comment.author_name}
              </button>
              {isVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
              <span className="text-gray-400 text-xs">
                {new Date(comment.created_date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{renderContent(comment.content)}</p>

            {comment.media_url && comment.media_type !== 'none' && (
              <div className="mt-2 rounded-lg overflow-hidden">
                {comment.media_type === 'image' ? (
                  <img src={comment.media_url} alt="Comment media" className="max-h-40 rounded" />
                ) : comment.media_type === 'video' ? (
                  <video src={comment.media_url} className="max-h-40 rounded" controls />
                ) : null}
              </div>
            )}

            {comment.voice_note_url && (
              <audio src={comment.voice_note_url} controls className="mt-2 w-full" />
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 px-2">
            <button className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
              <Heart className="w-3 h-3" /> {t('feed.like')}
            </button>
            <button onClick={() => onReply(comment)}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <Reply className="w-3 h-3" /> {t('feed.reply')}
            </button>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} allComments={allComments}
              currentUser={currentUser} onReply={onReply} isReply={true} verifiedMap={verifiedMap} />
          ))}
        </div>
      )}
    </div>
  );
}