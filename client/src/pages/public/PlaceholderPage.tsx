import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

interface PlaceholderProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderProps) {
  return (
    <>
      <PublicNavbar />
      <main className="pt-32 pb-20 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gold-line mb-4" />
          <h1 className="font-cinzel text-3xl font-semibold text-gray-900  tracking-normal">{title}</h1>
          <p className="mt-8 text-gray-600 leading-relaxed">
            Halaman ini sedang dalam pengembangan. Silakan kembali lagi nanti untuk melihat pembaruan terbaru mengenai {title.toLowerCase()} Perguruan Pencak Silat Padjadjaran.
          </p>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

