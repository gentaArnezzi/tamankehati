'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { publicApi } from '@/lib/public-api-client';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: { label: string; url: string; description: string }[];
  items?: {
    type: 'flora' | 'fauna' | 'taman';
    id: string;
    name: string;
    scientific_name?: string;
    image_url?: string;
    description?: string;
    status?: string;
  }[];
}

export default function TanyaKehatiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya Tanya Kehati, asisten AI untuk keanekaragaman hayati Indonesia. Saya dapat membantu Anda menemukan informasi tentang flora, fauna, taman konservasi, dan kegiatan konservasi. Silakan ajukan pertanyaan spesifik tentang keanekaragaman hayati Indonesia!',
      timestamp: new Date('2024-01-01T00:00:00Z') // Static timestamp to avoid hydration issues
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // Search for specific flora/fauna mentioned in the response
  const searchForSpecificItems = async (question: string, response: string) => {
    const items: Message['items'] = [];
    const lowerQuestion = question.toLowerCase();
    const lowerResponse = response.toLowerCase();

    try {
      // Common flora names to search for
      const floraKeywords = [
        'rafflesia', 'rafflesia arnoldii', 'anggrek', 'orchid', 'bunga bangkai',
        'amorphophallus', 'jati', 'teak', 'meranti', 'mahoni', 'mahogany',
        'cendana', 'sandalwood', 'kayu manis', 'cinnamon', 'pala', 'nutmeg'
      ];

      // Common fauna names to search for
      const faunaKeywords = [
        'harimau', 'tiger', 'orangutan', 'gajah', 'elephant', 'badak', 'rhinoceros',
        'komodo', 'dragon', 'burung cendrawasih', 'bird of paradise', 'elang', 'eagle',
        'kakatua', 'cockatoo', 'monyet', 'monkey', 'banteng', 'banteng'
      ];

      // Check for flora mentions
      for (const keyword of floraKeywords) {
        if (lowerQuestion.includes(keyword) || lowerResponse.includes(keyword)) {
          const floraResults = await publicApi.getFlora({ search: keyword, limit: 3 });
          for (const flora of floraResults.items) {
            items.push({
              type: 'flora',
              id: flora.id,
              name: flora.nama_umum || flora.nama_ilmiah,
              scientific_name: flora.nama_ilmiah,
              image_url: flora.gambar_utama,
              description: flora.deskripsi,
              status: flora.status_konservasi
            });
          }
          break; // Only search for the first match
        }
      }

      // Check for fauna mentions
      for (const keyword of faunaKeywords) {
        if (lowerQuestion.includes(keyword) || lowerResponse.includes(keyword)) {
          const faunaResults = await publicApi.getFauna({ search: keyword, limit: 3 });
          for (const fauna of faunaResults.items) {
            items.push({
              type: 'fauna',
              id: fauna.id,
              name: fauna.nama_umum || fauna.nama_ilmiah,
              scientific_name: fauna.nama_ilmiah,
              image_url: fauna.gambar_utama,
              description: fauna.deskripsi,
              status: fauna.status_konservasi
            });
          }
          break; // Only search for the first match
        }
      }

      // Check for taman/parks mentions
      if (lowerQuestion.includes('taman') || lowerQuestion.includes('konservasi') || 
          lowerResponse.includes('taman') || lowerResponse.includes('konservasi')) {
        const tamanResults = await publicApi.getTaman({ search: 'konservasi', limit: 3 });
        for (const taman of tamanResults.items) {
          items.push({
            type: 'taman',
            id: taman.id,
            name: taman.nama_taman,
            description: taman.deskripsi
          });
        }
      }
    } catch (error) {
      console.error('Error searching for specific items:', error);
    }

    return items;
  };

  // Link mapping for common questions to relevant pages
  const getRelevantLinks = (question: string, response: string) => {
    const links: { label: string; url: string; description: string }[] = [];
    const lowerQuestion = question.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Flora related questions
    if (lowerQuestion.includes('flora') || lowerQuestion.includes('tumbuhan') || lowerQuestion.includes('tanaman') || 
        lowerResponse.includes('flora') || lowerResponse.includes('tumbuhan')) {
      links.push({
        label: 'Katalog Flora Indonesia',
        url: '/flora',
        description: 'Jelajahi database flora Indonesia lengkap'
      });
    }

    // Fauna related questions
    if (lowerQuestion.includes('fauna') || lowerQuestion.includes('hewan') || lowerQuestion.includes('satwa') ||
        lowerResponse.includes('fauna') || lowerResponse.includes('hewan')) {
      links.push({
        label: 'Katalog Fauna Indonesia',
        url: '/fauna',
        description: 'Temukan informasi fauna Indonesia'
      });
    }

    // Taman/Conservation parks related questions
    if (lowerQuestion.includes('taman') || lowerQuestion.includes('konservasi') || lowerQuestion.includes('taman nasional') ||
        lowerResponse.includes('taman') || lowerResponse.includes('konservasi')) {
      links.push({
        label: 'Daftar Taman Konservasi',
        url: '/taman',
        description: 'Lihat semua taman konservasi di Indonesia'
      });
      
      // Specific questions about largest parks
      if (lowerQuestion.includes('terbesar') || lowerQuestion.includes('besar') || lowerQuestion.includes('luas')) {
        links.push({
          label: 'Pencarian Taman Terbesar',
          url: '/search?q=taman+terbesar+indonesia',
          description: 'Cari taman konservasi terbesar di Indonesia'
        });
      }
    }

    // Articles/News related questions
    if (lowerQuestion.includes('artikel') || lowerQuestion.includes('berita') || lowerQuestion.includes('kegiatan') ||
        lowerResponse.includes('artikel') || lowerResponse.includes('berita')) {
      links.push({
        label: 'Artikel & Berita',
        url: '/artikel',
        description: 'Baca artikel terbaru tentang keanekaragaman hayati'
      });
      links.push({
        label: 'Kegiatan Konservasi',
        url: '/kegiatan',
        description: 'Lihat kegiatan konservasi yang sedang berlangsung'
      });
    }

    // Search functionality
    if (lowerQuestion.includes('cari') || lowerQuestion.includes('pencarian') || lowerQuestion.includes('temukan')) {
      links.push({
        label: 'Pencarian Lanjutan',
        url: '/search',
        description: 'Gunakan fitur pencarian untuk menemukan informasi spesifik'
      });
    }

    // About/Information questions
    if (lowerQuestion.includes('tentang') || lowerQuestion.includes('apa itu') || lowerQuestion.includes('informasi')) {
      links.push({
        label: 'Tentang Taman Kehati',
        url: '/tentang',
        description: 'Pelajari lebih lanjut tentang Taman Kehati'
      });
    }

    return links;
  };

  const checkApiHealth = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}';
      const response = await fetch(`${apiUrl}/api/public/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if we get a meaningful response (not just static)
        const hasValidResponse = data.reply || data.message || data.response || data.content || data.answer;
        setIsOnline(!!hasValidResponse);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      console.error('API Health Check Failed:', error);
      setIsOnline(false);
    }
  };

  // Only scroll when assistant responds, not when user sends message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      // Add a small delay to ensure the message is rendered before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Check API health on mount
    checkApiHealth();
    
    // Update the initial message timestamp after hydration to show current time
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, timestamp: new Date() } : msg
    ));
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}';
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
      console.log('API Response:', data); // Debug log
      
      // Handle different possible response structures
      const aiResponse = data.reply || data.message || data.response || data.content || data.answer || JSON.stringify(data);
      
      // Check if we got a valid response
      if (!aiResponse || aiResponse.trim() === '') {
        throw new Error('Empty response from AI');
      }
      
      // Check if this is a generic fallback response
      const isGenericResponse = aiResponse.includes('Maaf, saya tidak memiliki data spesifik') || 
                               aiResponse.includes('tidak memiliki data') ||
                               aiResponse.includes('database Taman Kehati saat ini');
      
      if (isGenericResponse) {
        console.warn('AI returned generic fallback response - knowledge base may be empty');
        // Still show the response but mark as limited functionality
      }
      
      // Get relevant links and specific items based on the question and response
      const relevantLinks = getRelevantLinks(userMessage.content, aiResponse);
      const specificItems = await searchForSpecificItems(userMessage.content, aiResponse);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        links: relevantLinks.length > 0 ? relevantLinks : undefined,
        items: specificItems.length > 0 ? specificItems : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a network error or service unavailable
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isServiceUnavailable = error instanceof Error && error.message.includes('Failed to send message');
      const isEmptyResponse = error instanceof Error && error.message.includes('Empty response from AI');
      
      // Set offline status if there are API issues
      if (isNetworkError || isServiceUnavailable || isEmptyResponse) {
        setIsOnline(false);
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isNetworkError || isServiceUnavailable || isEmptyResponse
          ? '🤖 AI Tanya Kehati sedang tidak aktif saat ini. Silakan coba lagi nanti atau hubungi administrator untuk informasi lebih lanjut.'
          : 'Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi.',
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
    try {
      // Ensure we have a valid date
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        return '00:00';
      }
      
      return validDate.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Jakarta' // Consistent timezone
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '00:00';
    }
  };

  return (
    <main className="min-h-screen bg-white pt-16">
      {/* Modern Minimal Chat Interface */}
      <div className="container mx-auto max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
        {/* Minimal Header */}
        <div className="flex items-center justify-between py-6 px-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo/logo_tanyakehati.png" 
                alt="Tanya Kehati" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-light text-slate-900">Tanya Kehati</h1>
              <p className="text-xs text-slate-500">Asisten AI Konservasi</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isOnline ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`text-xs font-medium ${
              isOnline ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {!isOnline && (
              <button
                onClick={checkApiHealth}
                className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    message.content.includes('Maaf, saya tidak memiliki data spesifik') ||
                    message.content.includes('tidak memiliki data') ||
                    message.content.includes('database Taman Kehati saat ini')
                  ) && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-700 font-medium">
                        ⚠️ Informasi terbatas
                      </p>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show specific items with images for assistant messages */}
                  {message.role === 'assistant' && message.items && message.items.length > 0 && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs font-medium text-slate-600">🌿 Spesies yang Ditemukan:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {message.items.map((item, index) => (
                          <Link
                            key={index}
                            href={`/${item.type}/${item.id}`}
                            className="group block p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex gap-3">
                              {item.image_url && (
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-900 group-hover:text-slate-700 truncate">
                                  {item.name}
                                </h4>
                                {item.scientific_name && (
                                  <p className="text-xs text-slate-500 italic truncate">
                                    {item.scientific_name}
                                  </p>
                                )}
                                {item.status && (
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                    item.status === 'LC' ? 'bg-green-100 text-green-700' :
                                    item.status === 'VU' ? 'bg-yellow-100 text-yellow-700' :
                                    item.status === 'EN' ? 'bg-orange-100 text-orange-700' :
                                    item.status === 'CR' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {item.status}
                                  </span>
                                )}
                                {item.description && (
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show relevant links for assistant messages */}
                  {message.role === 'assistant' && message.links && message.links.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-slate-600">🔗 Informasi Terkait:</p>
                      <div className="space-y-1">
                        {message.links.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url}
                            className="flex items-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-700" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                                {link.label}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {link.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1.5 ${
                    message.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
                <div className="bg-slate-50 text-slate-900 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Mengetik...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Minimal Input */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Contoh: 'Apa itu Rafflesia arnoldii?' atau 'Taman konservasi di Jawa'..."
                disabled={isLoading}
                className="flex-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900 rounded-xl h-11 text-sm bg-slate-50"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="bg-slate-900 hover:bg-slate-800 text-white h-11 w-11 rounded-xl transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              Tanya Kehati menggunakan AI untuk memberikan informasi tentang keanekaragaman hayati Indonesia
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
