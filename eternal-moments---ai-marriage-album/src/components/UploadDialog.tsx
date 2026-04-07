import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, caption: string) => Promise<void>;
}

export default function UploadDialog({ isOpen, onClose, onUpload }: UploadDialogProps) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption) return;

    setIsAnalyzing(true);
    try {
      await onUpload(file, caption);
      onClose();
      // Reset
      setCaption('');
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Add to Album</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g., The First Dance"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
                    preview ? "border-transparent" : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/30"
                  )}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <>
                      <div className="mb-2 rounded-full bg-amber-50 p-3 text-amber-600">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Click to upload photo</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || !caption || isAnalyzing}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 py-4 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-125" />
                    Analyze & Add to Album
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
