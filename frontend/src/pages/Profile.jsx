const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Edit, Save, Loader2, MessageCircle, Heart, LogOut, Bell, Globe, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        location: user.location || '',
        cnic: user.cnic || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', user?.email],
    queryFn: () => db.entities.Post.filter({ author_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: userComments = [] } = useQuery({
    queryKey: ['userComments', user?.email],
    queryFn: () => db.entities.Comment.filter({ author_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => db.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setIsEditing(false);
    },
  });

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      const mediaType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'gif';
      
      await updateProfileMutation.mutateAsync({
        profile_image_url: file_url,
        profile_media_type: mediaType,
      });
    } catch (error) {
      console.error("Error uploading media:", error);
    }
    setIsUploadingMedia(false);
  };

  const handleSaveProfile = async () => {
    await updateProfileMutation.mutateAsync(formData);
  };

  const handleLogout = () => {
    db.auth.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Cover & Profile Image */}
        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-4">
          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            {user?.cover_image_url && (
              <img src={user.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            )}
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files[0]; if (!file) return;
              setIsUploadingMedia(true);
              const { file_url } = await db.integrations.Core.UploadFile({ file });
              await db.auth.updateMe({ cover_image_url: file_url });
              queryClient.invalidateQueries(['currentUser']);
              setIsUploadingMedia(false);
            }} className="hidden" id="cover-upload" />
            <label htmlFor="cover-upload"
              className="absolute bottom-3 right-3 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg text-sm text-gray-700 font-medium cursor-pointer flex items-center gap-1 shadow">
              <Camera className="w-4 h-4" /> Edit Cover
            </label>
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-16">
              {/* Profile Image */}
              <div className="relative">
                <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {isUploadingMedia ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : user?.profile_image_url ? (
                    user.profile_media_type === 'video' ? (
                      <video src={user.profile_image_url} className="w-full h-full object-cover" autoPlay loop muted />
                    ) : (
                      <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                      {user?.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <input
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="profile-media-upload"
                  disabled={isUploadingMedia}
                />
                <label htmlFor="profile-media-upload">
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-md">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => setShowNotificationSettings(true)}>
                      <Bell className="w-4 h-4 mr-2" /> Settings
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Your location"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.full_name}</h1>
                  {user?.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    {user?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user?.language && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{user.language === 'ur' ? 'Urdu' : 'English'}</span>
                      </div>
                    )}
                    {user?.phone_number && (
                      <span>📱 {user.phone_number}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-gray-50 border-b border-gray-200 rounded-none">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Posts ({userPosts.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Comments ({userComments.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                Activity
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Posts Tab */}
              <TabsContent value="posts">
                {userPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <Card key={post.id} className="p-4 border border-gray-200">
                        <p className="text-gray-800 mb-2">{post.content}</p>
                        {post.media_url && post.media_type !== 'none' && (
                          <div className="rounded-lg overflow-hidden border border-gray-200 mt-2">
                            {post.media_type === 'image' ? (
                              <img src={post.media_url} alt="Post" className="max-h-64 w-full object-cover" />
                            ) : (
                              <video src={post.media_url} controls className="max-h-64 w-full" />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>{new Date(post.created_date).toLocaleDateString()}</span>
                          <span>❤️ {post.likes_count || 0}</span>
                          <span>💬 {post.comments_count || 0}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments">
                {userComments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No comments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userComments.map((comment) => (
                      <Card key={comment.id} className="p-4 border border-gray-200">
                        <p className="text-gray-800">{comment.content}</p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {new Date(comment.created_date).toLocaleDateString()}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="space-y-3">
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 font-medium">Total Posts</p>
                        <p className="text-2xl font-bold text-blue-600">{userPosts.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 font-medium">Total Comments</p>
                        <p className="text-2xl font-bold text-purple-600">{userComments.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 font-medium">Member Since</p>
                        <p className="text-gray-600">{new Date(user?.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Notification Settings Dialog */}
        <NotificationSettings
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          user={user}
        />
      </div>
    </div>
  );
}

function NotificationSettings({ isOpen, onClose, user }) {
  const [settings, setSettings] = useState({});
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (user?.notification_preferences) {
      setSettings(user.notification_preferences);
    } else {
      setSettings({
        email_notifications: true,
        post_comments: true,
        poll_updates: true,
        campaign_updates: true,
        mentions: true,
      });
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => db.auth.updateMe({ notification_preferences: data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      onClose();
    },
  });

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email Notifications</Label>
            <Switch
              id="email"
              checked={settings.email_notifications}
              onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Post Comments</Label>
            <Switch
              id="comments"
              checked={settings.post_comments}
              onCheckedChange={(checked) => setSettings({...settings, post_comments: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="polls">Poll Updates</Label>
            <Switch
              id="polls"
              checked={settings.poll_updates}
              onCheckedChange={(checked) => setSettings({...settings, poll_updates: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="campaigns">Campaign Updates</Label>
            <Switch
              id="campaigns"
              checked={settings.campaign_updates}
              onCheckedChange={(checked) => setSettings({...settings, campaign_updates: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mentions">Mentions</Label>
            <Switch
              id="mentions"
              checked={settings.mentions}
              onCheckedChange={(checked) => setSettings({...settings, mentions: checked})}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}