import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function TermsConditionsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter">
      <div>
        <PublicNavbar />
        <main className="pt-44 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="gold-line mb-4" />
            <h1 className="font-cinzel text-3xl md:text-4xl font-semibold text-[#111111] mb-12  tracking-wide border-b border-stone-100 pb-6">
              Syarat & Ketentuan
            </h1>
            
            <div className="prose prose-stone max-w-none text-[14px] leading-relaxed text-stone-600 space-y-10">
              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">1. Ketentuan Keanggotaan</h2>
                <p>
                  Setiap individu yang mendaftar menjadi anggota Padepokan Pencak Silat Padjadjaran wajib menjunjung tinggi sumpah perguruan dan mematuhi Anggaran Dasar serta Anggaran Rumah Tangga (AD/ART) organisasi.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">2. Akurasi Data Pendaftaran</h2>
                <p>Pendaftar bertanggung jawab penuh atas kebenaran data yang dimasukkan. Pemalsuan identitas atau dokumen pendukung merupakan pelanggaran berat yang dapat mengakibatkan pembatalan keanggotaan secara sepihak.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">3. Kode Etik Pesilat</h2>
                <p>
                  Seluruh anggota dilarang keras menggunakan ilmu bela diri yang dipelajari untuk tindakan yang melanggar hukum, intimidasi, atau kesombongan. Ilmu bela diri Padjadjaran hanya digunakan untuk pertahanan diri, kesehatan, dan prestasi yang membanggakan perguruan serta bangsa.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">4. Kewajiban Administrasi</h2>
                <p>
                  Anggota wajib memenuhi kewajiban administrasi yang telah ditetapkan oleh pusat maupun cabang, termasuk biaya pendaftaran, iuran rutin (jika ada), dan biaya ujian kenaikan tingkat sesuai ketentuan yang berlaku.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">5. Hak Cipta dan Kekayaan Intelektual</h2>
                <p>
                  Segala bentuk logo, kurikulum, jurus-jurus, dan atribut resmi Perguruan Padjadjaran dilindungi oleh hak cipta. Penggunaan atribut tanpa izin resmi untuk kepentingan komersial di luar organisasi tidak diperbolehkan.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">6. Penyelesaian Perselisihan</h2>
                <p>
                  Apabila terjadi perselisihan antara anggota atau antara anggota dengan pengurus, maka penyelesaian akan diutamakan melalui jalur musyawarah berdasarkan asas kekeluargaan dan filosofi Silih Asah, Silih Asih, Silih Asuh.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

