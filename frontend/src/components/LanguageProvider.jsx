const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";

const enTranslations = {
  "nav": {
    "feed": "Feed",
    "live": "Live",
    "polls": "Polls",
    "campaigns": "Campaigns",
    "donate": "Donate",
    "sponsor": "Sponsor",
    "about": "About",
    "profile": "Profile",
    "language": "EN"
  },
  "feed": {
    "whatsHappening": "What's happening in My64 village? ✨",
    "photoVideo": "Photo/Video",
    "post": "Post",
    "like": "Like",
    "comment": "Comment",
    "share": "Share",
    "seeMore": "See Full",
    "translate": "Translate",
    "translated": "Translated",
    "original": "Show Original",
    "writeComment": "Write a comment... (use @ to mention)",
    "reply": "Reply",
    "replyingTo": "Replying to"
  },
  "profile": {
    "editProfile": "Edit Profile",
    "settings": "Settings",
    "saveChanges": "Save Changes",
    "cancel": "Cancel",
    "fullName": "Full Name",
    "bio": "Bio",
    "location": "Location",
    "posts": "Posts",
    "comments": "Comments",
    "activity": "Activity",
    "noPosts": "No posts yet",
    "noComments": "No comments yet",
    "totalPosts": "Total Posts",
    "totalComments": "Total Comments",
    "memberSince": "Member Since",
    "logout": "Logout",
    "notificationSettings": "Notification Settings",
    "emailNotifications": "Email Notifications",
    "postComments": "Post Comments",
    "pollUpdates": "Poll Updates",
    "campaignUpdates": "Campaign Updates",
    "mentions": "Mentions"
  },
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "submit": "Submit",
    "search": "Search",
    "filter": "Filter"
  }
};

const urTranslations = {
  "nav": {
    "feed": "فیڈ",
    "live": "لائیو",
    "polls": "رائے شماری",
    "campaigns": "مہمات",
    "donate": "عطیہ",
    "sponsor": "کفالت",
    "about": "تعارف",
    "profile": "پروفائل",
    "language": "اردو"
  },
  "feed": {
    "whatsHappening": "My64 گاؤں میں کیا ہو رہا ہے؟ ✨",
    "photoVideo": "تصویر/ویڈیو",
    "post": "پوسٹ کریں",
    "like": "پسند",
    "comment": "تبصرہ",
    "share": "شیئر",
    "seeMore": "مکمل دیکھیں",
    "translate": "ترجمہ",
    "translated": "ترجمہ شدہ",
    "original": "اصل متن",
    "writeComment": "تبصرہ لکھیں... (@ استعمال کریں)",
    "reply": "جواب",
    "replyingTo": "جواب دے رہے ہیں"
  },
  "profile": {
    "editProfile": "پروفائل میں ترمیم",
    "settings": "ترتیبات",
    "saveChanges": "تبدیلیاں محفوظ کریں",
    "cancel": "منسوخ",
    "fullName": "پورا نام",
    "bio": "تعارف",
    "location": "مقام",
    "posts": "پوسٹس",
    "comments": "تبصرے",
    "activity": "سرگرمی",
    "noPosts": "ابھی کوئی پوسٹ نہیں",
    "noComments": "ابھی کوئی تبصرہ نہیں",
    "totalPosts": "کل پوسٹس",
    "totalComments": "کل تبصرے",
    "memberSince": "رکن بنے",
    "logout": "لاگ آؤٹ",
    "notificationSettings": "اطلاعات کی ترتیبات",
    "emailNotifications": "ای میل اطلاعات",
    "postComments": "پوسٹ تبصرے",
    "pollUpdates": "رائے شماری اپ ڈیٹس",
    "campaignUpdates": "مہم اپ ڈیٹس",
    "mentions": "تذکرے"
  },
  "common": {
    "loading": "لوڈ ہو رہا ہے...",
    "save": "محفوظ کریں",
    "delete": "حذف کریں",
    "edit": "ترمیم",
    "submit": "جمع کروائیں",
    "search": "تلاش کریں",
    "filter": "فلٹر"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [translations, setTranslations] = useState(enTranslations);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  useEffect(() => {
    if (user?.language) {
      setCurrentLanguage(user.language);
      setTranslations(user.language === 'ur' ? urTranslations : enTranslations);
    }
  }, [user?.language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return value || key;
  };

  const isRTL = currentLanguage === 'ur';

  return (
    <LanguageContext.Provider value={{ t, currentLanguage, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}