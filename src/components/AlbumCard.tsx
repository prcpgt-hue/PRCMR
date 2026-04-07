import React from 'react';
import { motion } from 'motion/react';
import { Photo } from '../types';
import { Tag, Calendar, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

interface AlbumCardProps {
  photo: Photo;
  index: number;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ photo, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl"
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={photo.url}
          alt={photo.caption}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
            {photo.category}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="h-3 w-3" />
            {photo.date}
          </div>
        </div>
        
        <h3 className="mb-3 font-serif text-lg text-gray-900 line-clamp-1">
          {photo.caption}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {photo.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-white/90 p-2 text-amber-600 backdrop-blur-sm">
          <Camera className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
};

export default AlbumCard;
