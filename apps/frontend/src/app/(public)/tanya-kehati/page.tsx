'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TanyaKehatiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya Tanya Kehati, asisten AI untuk keanekaragaman hayati Indonesia. Saya dapat membantu Anda menemukan informasi tentang flora, fauna, taman konservasi, dan kegiatan konservasi. Ada yang ingin Anda tanyakan?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/public/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/home/hero.jpg"
            alt="Tanya Kehati - Asisten AI untuk Keanekaragaman Hayati Indonesia"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Dark black overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Subtle bottom overlay with standard dark brown */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

        {/* Floating elements with brown theme */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-amber-500 rounded-full animate-float delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float delay-500"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-950/40 backdrop-blur-sm rounded-2xl mb-6 border border-amber-800/30">
                <MessageCircle className="w-10 h-10 text-amber-50" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4">
                Tanya Kehati
              </h1>
              <p className="text-xl text-amber-50 max-w-2xl mx-auto">
                Asisten AI untuk keanekaragaman hayati Indonesia. Dapatkan informasi tentang flora, fauna, taman konservasi, dan kegiatan konservasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="container mx-auto px-6 py-8 md:py-12 max-w-5xl -mt-8 relative z-10">
        <Card className="shadow-2xl border border-slate-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tanya Kehati</h2>
                <p className="text-sm text-slate-500">Asisten AI Konservasi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>

          {/* Messages */}
          <CardContent className="p-0">
            <div className="h-[60vh] min-h-[400px] max-h-[600px] overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="bg-white text-slate-900 rounded-2xl px-5 py-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      <span className="text-sm">Tanya Kehati sedang mengetik...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanyakan tentang keanekaragaman hayati Indonesia..."
                disabled={isLoading}
                className="flex-1 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-xl h-12 text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 h-12 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Kirim
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-500 text-center">
                Tanya Kehati dapat membantu Anda dengan informasi flora, fauna, taman konservasi, dan kegiatan konservasi
              </p>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Asisten AI</h3>
              <p className="text-sm text-slate-600">
                Dapatkan jawaban cepat tentang keanekaragaman hayati Indonesia
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">24/7 Tersedia</h3>
              <p className="text-sm text-slate-600">
                Tanya Kehati siap membantu kapan saja Anda memerlukan informasi
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Informasi Lengkap</h3>
              <p className="text-sm text-slate-600">
                Akses data tentang flora, fauna, taman konservasi, dan kegiatan konservasi
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
