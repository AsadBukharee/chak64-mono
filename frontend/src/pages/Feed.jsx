const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Loader2, ChevronDown, Languages, MoreVertical, Pencil, Trash2, X, Facebook, Link, Flag, Eye, EyeOff, Users, Globe, Play, BadgeCheck } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import MediaViewer from "@/components/MediaViewer";
import { useTranslation } from "@/components/LanguageProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Feed() {
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [viewerState, setViewerState] = useState({ isOpen: false, initialIndex: 0 });
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => db.entities.Post.list('-created_date'),
  });

  // Collect all media from posts for the viewer
  const allMedia = posts.flatMap(p => {
    if (p.media_items && p.media_items.length > 0) {
      return p.media_items.map(item => ({ ...item, postId: p.id }));
    } else if (p.media_url && p.media_type !== 'none') {
      return [{ media_url: p.media_url, media_type: p.media_type, postId: p.id }];
    }
    return [];
  });

  const handleOpenViewer = (postId, mediaUrl) => {
    const index = allMedia.findIndex(m => m.postId === postId && m.media_url === mediaUrl);
    if (index !== -1) {
      setViewerState({ isOpen: true, initialIndex: index });
    }
  };

  const createPostMutation = useMutation({
    mutationFn: (postData) => db.entities.Post.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setPostContent("");
      setSelectedFiles([]);
    },
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (selectedFiles.length + files.length > 5) {
      alert("You can only upload up to 5 files per post.");
      return;
    }

    setIsUploading(true);
    const newMediaItems = [];
    
    for (const file of files) {
      try {
        const { file_url } = await db.integrations.Core.UploadFile({ file });
        newMediaItems.push({
          media_url: file_url,
          media_type: file.type.startsWith('image/') ? 'image' : 'video'
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    
    setSelectedFiles(prev => [...prev, ...newMediaItems]);
    setIsUploading(false);
  };

  const handleCreatePost = async () => {
    if (!user) {
      db.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!postContent.trim() && selectedFiles.length === 0) return;
    
    const firstMedia = selectedFiles[0];
    await createPostMutation.mutateAsync({
      content: postContent,
      media_url: firstMedia?.media_url || "",
      media_type: firstMedia?.media_type || "none",
      media_items: selectedFiles,
      author_name: user.full_name,
      author_email: user.email,
      visibility: visibility,
    });
  };

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Create Post Card */}
        <Card className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
          <div className="space-y-3">
            <MentionTextarea
              value={postContent}
              onChange={setPostContent}
              placeholder={t('feed.whatsHappening')}
            />

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    {file.media_type === 'image' ? (
                      <img src={file.media_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <video src={file.media_url} className="w-full h-full object-cover rounded-lg" />
                    )}
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-black transition-colors"
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex gap-2">
                <input type="file" accept="image/*,video/*" multiple onChange={handleFileSelect}
                  className="hidden" id="media-upload" disabled={isUploading || selectedFiles.length >= 5} />
                <label htmlFor="media-upload">
                  <Button type="button" variant="ghost" className="text-blue-600 hover:bg-blue-50"
                    disabled={isUploading || selectedFiles.length >= 5} asChild>
                    <span className="cursor-pointer flex items-center gap-2">
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                      {t('feed.photoVideo')} {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </span>
                  </Button>
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends</option>
                  <option value="only_me">🔒 Only Me</option>
                </select>
              </div>
              <Button onClick={handleCreatePost}
                disabled={(!postContent.trim() && selectedFiles.length === 0) || createPostMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {t('feed.post')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} onMediaClick={(url) => handleOpenViewer(post.id, url)} />
            ))}
          </div>
        )}

        <MediaViewer
          isOpen={viewerState.isOpen}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          mediaItems={allMedia}
          initialIndex={viewerState.initialIndex}
        />
      </div>
    </div>
  );
}

// ── MediaGrid ───────────────────────────────────────────────────────────────
function MediaGrid({ items, onMediaClick }) {
  if (!items || items.length === 0) return null;

  const count = items.length;
  const gridClass = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : count === 3 ? 'grid-cols-2' : 'grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-1 rounded-lg overflow-hidden border border-gray-200`}>
      {items.map((item, idx) => {
        const isExtra = idx === 3 && count > 4;
        const show = idx < 4;
        if (!show) return null;

        return (
          <div 
            key={idx} 
            className={`relative cursor-zoom-in group aspect-video ${count === 3 && idx === 0 ? 'col-span-2' : ''}`}
            onClick={() => onMediaClick(item.media_url)}
            onDoubleClick={() => onMediaClick(item.media_url)}
          >
            {item.media_type === 'image' ? (
              <img src={item.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
            ) : (
              <video src={item.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            )}
            {isExtra && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-2xl font-bold">
                +{count - 3}
              </div>
            )}
            {item.media_type === 'video' && !isExtra && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mention-aware Textarea ──────────────────────────────────────────────────
function MentionTextarea({ value, onChange, placeholder }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(null);
  const textareaRef = useRef(null);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => db.entities.User.list(),
    enabled: showSuggestions,
  });

  const filtered = allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 6);

  const handleChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(val);

    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const before = value.slice(0, mentionStart);
    const after = value.slice(textareaRef.current.selectionStart);
    onChange(before + `@${user.full_name} ` + after);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg min-h-[80px] resize-none p-3 text-sm outline-none"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-48 overflow-y-auto">
          {filtered.map(u => (
            <button key={u.id} onMouseDown={() => insertMention(u)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {u.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                <p className="text-xs text-gray-400">@{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PostCard ────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onMediaClick }) {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportNotes, setReportNotes] = useState("");
  const [liked, setLiked] = useState(false);
  const queryClient = useQueryClient();
  const { t, currentLanguage } = useTranslation();
  const menuRef = useRef(null);

  const isOwner = currentUser?.email === post.author_email;
  const postUrl = `${window.location.origin}${window.location.pathname}?post=${post.id}`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: commentsCount = 0 } = useQuery({
    queryKey: ['commentsCount', post.id],
    queryFn: async () => {
      const comments = await db.entities.Comment.filter({ post_id: post.id });
      return comments.length;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => db.entities.Post.update(post.id, data),
    onSuccess: () => { queryClient.invalidateQueries(['posts']); setIsEditing(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => db.entities.Post.delete(post.id),
    onSuccess: () => queryClient.invalidateQueries(['posts']),
  });

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    await db.entities.Post.update(post.id, {
      likes_count: (post.likes_count || 0) + (newLiked ? 1 : -1),
    });
    queryClient.invalidateQueries(['posts']);
  };

  const handleTranslate = async () => {
    if (isTranslated) { setIsTranslated(false); return; }
    setIsTranslating(true);
    const targetLang = currentLanguage === 'ur' ? 'Urdu' : 'English';
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `Translate the following text to ${targetLang}. Only return the translated text, nothing else:\n\n${post.content}`,
    });
    setTranslatedText(result);
    setIsTranslated(true);
    setIsTranslating(false);
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(`${post.author_name}: ${post.content.slice(0, 100)}`);
    const url = encodeURIComponent(postUrl);
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    if (platform === 'copy') {
      navigator.clipboard.writeText(postUrl);
      setShowShareDialog(false);
    }
  };

  const navigateToProfile = (email) => {
    window.location.href = `/Profile?user=${email}`;
  };

  const contentToShow = isTranslated ? translatedText : post.content;
  const shouldTruncate = !isExpanded && contentToShow.length > 200;
  const displayContent = shouldTruncate ? contentToShow.slice(0, 200) + '...' : contentToShow;

  return (
    <Card className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigateToProfile(post.author_email)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {post.author_name?.[0]?.toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="text-gray-900 font-semibold hover:text-blue-600">{post.author_name}</h3>
              {post.author_is_verified && (
                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-500 text-xs">
              {new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </button>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => { deleteMutation.mutate(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
        {!isOwner && (
          <button onClick={() => setShowReportDialog(true)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors" title="Report">
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="mb-3 space-y-2">
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-blue-500"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={() => updateMutation.mutate({ content: editContent })}
              disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Save
            </Button>
          </div>
        </div>
      ) : (
        /* Post Content */
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{displayContent}</p>
          <div className="flex gap-3 mt-2">
            {contentToShow.length > 200 && (
              <button onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700">
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                {isExpanded ? 'See Less' : t('feed.seeMore')}
              </button>
            )}
            <button onClick={handleTranslate} disabled={isTranslating}
              className="flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-700 disabled:opacity-50">
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              {isTranslating ? 'Translating...' : isTranslated ? t('feed.original') : t('feed.translate')}
            </button>
          </div>
        </div>
      )}

      {/* Media */}
      <div className="mb-3">
        {post.media_items && post.media_items.length > 0 ? (
          <MediaGrid items={post.media_items} onMediaClick={onMediaClick} />
        ) : post.media_url && post.media_type !== 'none' ? (
          <div 
            className="rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in"
            onClick={() => onMediaClick(post.media_url)}
            onDoubleClick={() => onMediaClick(post.media_url)}
          >
            {post.media_type === 'image' ? (
              <img src={post.media_url} alt="Post media" className="w-full max-h-96 object-cover hover:scale-[1.02] transition-transform duration-500" />
            ) : (
              <video src={post.media_url} className="w-full max-h-96 object-cover hover:scale-[1.02] transition-transform duration-500" />
            )}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 py-3 border-t border-gray-100">
        <button onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-600 hover:text-red-600'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
          <span className="text-sm font-medium">{post.likes_count || 0}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>
        <button onClick={() => setShowShareDialog(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments */}
      {showComments && currentUser && (
        <CommentSection postId={post.id} currentUser={currentUser} />
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-xs mx-4">
          <DialogHeader><DialogTitle className="text-base flex items-center gap-2"><Flag className="w-4 h-4 text-orange-500" /> Report Post</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reason</label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="spam">Spam</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="violence">Violence</option>
                <option value="misinformation">Misinformation</option>
                <option value="nudity">Nudity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Notes (optional)</label>
              <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Tell us more..." />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowReportDialog(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={async () => {
                await db.entities.Report.create({
                  post_id: post.id,
                  reporter_email: currentUser.email,
                  reporter_name: currentUser.full_name,
                  reason: reportReason,
                  notes: reportNotes,
                  post_author_email: post.author_email,
                  post_content_preview: post.content?.slice(0, 200),
                  status: 'pending',
                });
                setShowReportDialog(false);
                setReportNotes("");
                setReportReason("spam");
              }} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm font-medium transition-colors">
                Submit Report
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-xs mx-4">
          <DialogHeader><DialogTitle className="text-base">Share Post</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            {/* Copy link row */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 flex-1 truncate min-w-0">{postUrl}</span>
              <button onClick={() => handleShare('copy')}
                className="flex-shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md font-medium transition-colors">
                Copy
              </button>
            </div>
            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button onClick={() => handleShare('facebook')}
                className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                <Facebook className="w-4 h-4" />
                Facebook
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}