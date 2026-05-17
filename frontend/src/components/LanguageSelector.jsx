const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelector({ isOpen, onClose, isInitialSetup = false }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
    }
  }, [user]);

  const updateLanguageMutation = useMutation({
    mutationFn: async (language) => {
      await db.auth.updateMe({
        language: language,
        has_selected_language: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      if (onClose) onClose();
    },
  });

  const handleSaveLanguage = async () => {
    await updateLanguageMutation.mutateAsync(selectedLanguage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isInitialSetup ? undefined : onClose}>
      <DialogContent className="bg-white max-w-md" hideClose={isInitialSetup}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isInitialSetup ? 'Welcome to My64!' : 'Select Language'}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            {isInitialSetup 
              ? 'Please select your preferred language to continue' 
              : 'Choose the language you would like to use on the platform'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">


          <div className="space-y-3">
            {/* English Option */}
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                selectedLanguage === 'en'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🇬🇧</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">English</h3>
                    <p className="text-sm text-gray-600">Use English language</p>
                  </div>
                </div>
                {selectedLanguage === 'en' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Urdu Option */}
            <button
              onClick={() => setSelectedLanguage('ur')}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                selectedLanguage === 'ur'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🇵🇰</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">اردو</h3>
                    <p className="text-sm text-gray-600">اردو زبان استعمال کریں</p>
                  </div>
                </div>
                {selectedLanguage === 'ur' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {!isInitialSetup && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSaveLanguage}
            disabled={updateLanguageMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
          >
            {updateLanguageMutation.isPending ? 'Saving...' : isInitialSetup ? 'Continue' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}