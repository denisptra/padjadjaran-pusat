import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import padepokanImg from '../../assets/images/padepokan.jpeg';

export default function AuthLeftColumn() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-16 relative text-white h-screen w-full overflow-hidden bg-stone-950">
      {/* Background Image with Balanced Dark & High Contrast Filter */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 filter contrast-[1.1] brightness-[0.45] saturate-0"
        style={{
          backgroundImage: `url('${padepokanImg}')`,
        }}
      />
      
      {/* Dark Overlay Gradient - More Transparent for Visibility */}
      <div 
        className="absolute inset-0 z-1"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(201, 162, 39, 0.08) 100%)`,
        }}
      />

      {/* Top Branding Logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-block">
          <Logo theme="light" />
        </Link>
      </div>

      {/* Center Philosophy Signature */}
      <div className="relative z-10 my-auto max-w-lg space-y-6 py-8">
        <h2 className="font-cinzel text-4xl md:text-5xl lg:text-[3rem] font-semibold leading-[1.15] drop-shadow-lg text-white">
          Silih Asah,<br />
          Silih Asih,<br />
          Silih Asuh,<br />
          Silih Wawangi
        </h2>
        <div className="h-1 w-20 bg-[#C9A227] rounded-full" />
        <p className="text-[13px] text-stone-300 leading-relaxed font-normal">
          Akses pusat warisan bela diri. Kelola cabang, awasi perkembangan anggota, dan lestarikan warisan Padjadjaran.
        </p>
      </div>

      {/* Bottom Secretariat Info - Normal Text */}
      <div className="relative z-10 mt-auto">
        <p className="text-[13px] text-[#C9A227] font-semibold mb-1 font-cinzel tracking-wider uppercase">Sekretariat Pusat</p>
        <p className="text-[12px] text-stone-300 leading-relaxed max-w-md font-normal opacity-80">
          Jl. Raya Karangnunggal Km. 21 Kp. Adawarn Rt.09/04 Desa Sirnajaya, Kec. Sukaraja Kab. Tasikmalaya 46183 Provinsi Jawa Barat
        </p>
      </div>
    </div>
  );
}

