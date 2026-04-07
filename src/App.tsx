import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, Sparkles, Heart, Image as ImageIcon, Filter, Search, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Photo, AnalysisResult } from './types';
import AlbumCard from './components/AlbumCard';
import UploadDialog from './components/UploadDialog';
import { cn } from './lib/utils';

const INITIAL_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    caption: 'The Vows',
    tags: ['Ceremony', 'Outdoor', 'Floral'],
    date: 'June 12, 2025',
    category: 'Ceremony'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
    caption: 'Reception Details',
    tags: ['Table Setting', 'Gold', 'Elegant'],
    date: 'June 12, 2025',
    category: 'Details'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop',
    caption: 'The First Dance',
    tags: ['Dance', 'Couple', 'Emotional'],
    date: 'June 12, 2025',
    category: 'Reception'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop',
    caption: 'Bridal Portrait',
    tags: ['Bride', 'Classic', 'Portrait'],
    date: 'June 12, 2025',
    category: 'Portraits'
  }
];

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filter, setFilter] = useState<Photo['category'] | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = photos.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const analyzeImage = async (file: File): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Convert file to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: "Analyze this wedding photo and provide 3-5 relevant tags and a short category (Ceremony, Reception, Portraits, or Details). Return as JSON.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            category: {
              type: Type.STRING,
              enum: ['Ceremony', 'Reception', 'Portraits', 'Details'],
            },
          },
          required: ['tags', 'category'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      tags: result.tags || ['Wedding'],
      description: result.category || 'Details'
    };
  };

  const handleUpload = async (file: File, caption: string) => {
    const analysis = await analyzeImage(file);
    
    const newPhoto: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      caption,
      tags: analysis.tags,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      category: analysis.description as Photo['category']
    };

    setPhotos(prev => [newPhoto, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight">Eternal Moments</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">AI Marriage Album</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {['All', 'Ceremony', 'Reception', 'Portraits', 'Details'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat as any)}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-2",
                    filter === cat ? "text-amber-600" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {cat}
                  {filter === cat && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              <Plus className="h-4 w-4" />
              Add Photo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-20 relative rounded-[40px] overflow-hidden bg-gray-900 h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Wedding"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-widest mb-6">
                <Sparkles className="h-3 w-3 text-amber-400" />
                AI-Enhanced Gallery
              </span>
              <h2 className="font-serif text-5xl md:text-7xl text-white font-medium mb-6 leading-tight">
                Preserving Your <br /> 
                <span className="italic text-amber-200">Beautiful Journey</span>
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto text-lg font-light leading-relaxed mb-10">
                Experience your wedding memories through the lens of artificial intelligence. 
                Our CNN-powered system automatically organizes and tags your most precious moments.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-gray-900 px-8 py-4 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Start Your Album
                  <Plus className="h-5 w-5" />
                </button>
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-800">
                      <img src={`https://picsum.photos/seed/wedding${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] text-white font-bold">
                    +2k
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Filter Bar (Mobile) */}
        <div className="md:hidden mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {['All', 'Ceremony', 'Reception', 'Portraits', 'Details'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all",
                  filter === cat ? "bg-amber-100 text-amber-700" : "bg-white text-gray-500 border border-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-serif text-3xl font-semibold text-gray-900">The Gallery</h3>
            <p className="text-sm text-gray-500 mt-1">Showing {filteredPhotos.length} moments from your day</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, index) => (
              <AlbumCard key={photo.id} photo={photo} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <ImageIcon className="h-10 w-10" />
            </div>
            <h4 className="font-serif text-2xl font-medium text-gray-900 mb-2">No memories found</h4>
            <p className="text-gray-500 max-w-xs">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="font-serif text-lg font-bold">Eternal Moments</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Eternal Moments. Powered by AI Vision.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Camera className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Sparkles className="h-5 w-5" /></a>
          </div>
        </div>
      </footer>

      <UploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload}
      />
    </div>
  );
}
