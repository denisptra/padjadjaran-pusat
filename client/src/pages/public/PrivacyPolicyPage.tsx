import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter">
      <div>
        <PublicNavbar />
        <main className="pt-44 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="gold-line mb-4" />
            <h1 className="font-cinzel text-3xl md:text-4xl font-semibold text-[#111111] mb-12  tracking-wide border-b border-stone-100 pb-6">
              Kebijakan Privasi
            </h1>
            
            <div className="prose prose-stone max-w-none text-[14px] leading-relaxed text-stone-600 space-y-10">
              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">1. Pendahuluan</h2>
                <p>
                  Selamat datang di website resmi Padepokan Pencak Silat Padjadjaran Pusat. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda menggunakan layanan kami.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">2. Informasi yang Kami Kumpulkan</h2>
                <p>Kami mengumpulkan informasi identitas pribadi yang Anda berikan secara sukarela saat mendaftar sebagai anggota, termasuk namun tidak terbatas pada:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-[#C9A227]">
                  <li>Nama lengkap, tempat dan tanggal lahir.</li>
                  <li>Alamat email dan nomor telepon yang aktif.</li>
                  <li>Nomor Induk Kependudukan (NIK) dan alamat domisili lengkap.</li>
                  <li>Dokumen pendukung seperti foto KTP, pas foto terbaru, dan surat rekomendasi.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">3. Penggunaan Informasi</h2>
                <p>Informasi yang kami kumpulkan digunakan secara eksklusif untuk kepentingan organisasi, antara lain:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-[#C9A227]">
                  <li>Memproses dan memverifikasi pendaftaran keanggotaan resmi.</li>
                  <li>Penerbitan Kartu Tanda Anggota (KTA) digital maupun fisik.</li>
                  <li>Menghubungi anggota terkait kegiatan, ujian kenaikan tingkat, atau agenda resmi perguruan.</li>
                  <li>Pemetaan persebaran anggota untuk pengembangan cabang di seluruh wilayah.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">4. Keamanan Data</h2>
                <p>
                  Kami menerapkan langkah-langkah keamanan teknis yang ketat untuk melindungi data Anda dari akses yang tidak sah. Data pribadi Anda disimpan dalam server yang aman dan hanya dapat diakses oleh administrator yang memiliki kewenangan khusus.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-cinzel text-xl font-semibold text-stone-800  tracking-wide">5. Perubahan Kebijakan</h2>
                <p>
                  Kebijakan Privasi ini dapat diperbarui sewaktu-waktu sesuai dengan perkembangan hukum dan kebutuhan organisasi. Setiap perubahan akan diumumkan secara transparan melalui website ini.
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

