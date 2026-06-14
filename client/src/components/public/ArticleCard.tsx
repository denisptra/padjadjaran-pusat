import React from 'react';
import { GoogleIcon } from '../ui/Icons';
import defaultImg from '../../assets/images/padepokan.jpeg';

interface ArticleCardProps {
  article: any;
  index: number;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="flex flex-col group cursor-pointer animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg mb-4 shadow-sm border border-stone-100">
        <img
          src={article.image || defaultImg}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-[#C9A227] text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm tracking-wider uppercase">
            {article.type}
          </span>
          {article.category && article.category.toLowerCase() !== article.type.toLowerCase() && (
            <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-[9px] font-bold px-2 py-1 rounded shadow-sm tracking-wider uppercase border border-stone-200">
              {article.category}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-stone-400 text-[11px] mb-2 font-inter">
          <GoogleIcon name="calendar_today" size={12} className="text-[#C9A227]" />
          <span>{article.date}</span>
        </div>
        <h3 className="font-cinzel text-[13px] font-semibold text-stone-900 leading-snug group-hover:text-[#C9A227] transition-colors line-clamp-2 mb-2 ">
          {article.title}
        </h3>
        <p className="text-[13px] text-stone-500 leading-relaxed line-clamp-3 font-inter">
          {article.description}
        </p>
      </div>
    </article>
  );
};

export default ArticleCard;

