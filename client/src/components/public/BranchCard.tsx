import React from 'react';
import { GoogleIcon } from '../ui/Icons';

interface BranchCardProps {
  branch: any;
}

const BranchCard: React.FC<BranchCardProps> = ({ branch }) => {
  return (
    <div className="bg-white border border-[#E5E0D3] rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#C9A227] group">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="font-cinzel text-lg font-semibold text-stone-900 leading-tight group-hover:text-[#C9A227] transition-colors ">
            {branch.name}
          </h3>
          <div className="bg-[#C9A227]/10 p-2 rounded-lg text-[#C9A227]">
            <GoogleIcon name="location_on" size={20} />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <GoogleIcon name="map" size={16} className="text-stone-400 mt-0.5" />
            <p className="text-[12px] text-stone-600 leading-relaxed font-inter">
              {branch.address}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <GoogleIcon name="person" size={16} className="text-stone-400" />
            <p className="text-[12px] text-stone-600 font-inter">
              Kepala: <span className="font-normal text-stone-800">{branch.headName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <GoogleIcon name="phone" size={16} className="text-stone-400" />
            <p className="text-[12px] text-stone-600 font-inter">{branch.phone}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-50 flex justify-between items-center">
          <span className="text-[10px] font-normal text-[#C9A227]  tracking-normal bg-[#C9A227]/5 px-2 py-1 rounded">
            {branch.city}, {branch.province}
          </span>
          <button className="text-[12px] font-normal text-stone-400 hover:text-[#C9A227] transition-colors flex items-center gap-1">
            Detail <GoogleIcon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchCard;

