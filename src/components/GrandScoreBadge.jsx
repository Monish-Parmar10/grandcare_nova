import React from 'react';
import { Star } from 'lucide-react';

const GrandScoreBadge = ({ score }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-3 rounded-full shadow-lg font-black text-xl">
      <Star className="w-7 h-7 fill-white" />
      <span>{score} GrandPoints</span>
    </div>
  );
};

export default GrandScoreBadge;
