const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HelpChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    if (!conversation && user) {
      try {
        const conv = await db.agents.createConversation({
          agent_name: "my64_helper",
          metadata: {
            name: `${user.full_name} - Help Chat`,
            description: "User help conversation"
          }
        });
        setConversation(conv);
        
        // Subscribe to updates
        const unsubscribe = db.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending || !conversation) return;

    setIsSending(true);
    try {
      await db.agents.addMessage(conversation, {
        role: "user",
        content: message
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!conversation) {
      initializeChat();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-2 md:bottom-6 md:right-6 z-50 w-[calc(100vw-16px)] max-w-[380px] h-[500px] md:h-[550px] bg-white shadow-2xl border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">My64 Helper</h3>
                <p className="text-white/80 text-xs">مدد کے لیے یہاں ہوں</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-2">السلام علیکم!</p>
                <p className="text-gray-500 text-xs px-4">
                  میں آپ کی مدد کے لیے حاضر ہوں۔ آپ مجھ سے کچھ بھی پوچھ سکتے ہیں!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap" dir="auto">
                      {msg.content}
                    </p>
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        {msg.tool_calls.map((tool, idx) => (
                          <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>جاری ہے...</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-2">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="اپنا سوال لکھیں..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending || !conversation}
                className="border-gray-200 focus:border-blue-500 rounded-full"
                dir="auto"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending || !conversation}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}