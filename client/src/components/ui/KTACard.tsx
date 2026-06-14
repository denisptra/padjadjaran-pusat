import React, { useRef, useState, useEffect } from 'react';
import defaultLogo from '../../assets/images/logo-pencaksilat.svg';
import logoKasepuhan from '../../assets/images/logo-kasepuhan.png';
import { API_URL } from '../../services/api';

type KTACardProps = {
  fullName: string;
  ktaNumber: string;
  memberType?: string;
  wilayahName?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  address?: string;
  status?: string;
  photoUrl?: string;
  logoSrc?: string;
  qrSrc?: string;
  approvedAt?: string;
  registeredAt?: string;
  expiryDate?: string;
};

const KTACard: React.FC<KTACardProps> = ({
  fullName,
  ktaNumber,
  memberType = 'Umum',
  wilayahName,
  placeOfBirth,
  dateOfBirth,
  address,
  photoUrl,
  logoSrc,
  qrSrc,
  approvedAt,
  registeredAt,
  expiryDate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 0.75;
      if (width < 768) return 0.9;
    }
    return 1;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setScale(Math.min(width / 450, 1));
        }
      }
    });

    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const typeConfig = getMemberTypeConfig(memberType);
  const ttl = [placeOfBirth, formatDateLong(dateOfBirth)].filter(Boolean).join(', ');
  const titleText = getCardTitle(memberType, ktaNumber);

  const finalExpiryDate =
    expiryDate ||
    getExpiryDate({
      approvedAt,
      registeredAt,
    });

  return (
    <div
      ref={containerRef}
      className="w-full mx-auto overflow-hidden flex items-center justify-center py-2"
      style={{ height: `${Math.round(285 * scale) + 16}px` }}
    >
      <div
        className="w-[450px] select-none overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm aspect-[1.58/1] flex flex-col origin-center shrink-0"
        style={{
          transform: `scale(${scale * (isHovered ? 1.03 : 1)})`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div
          className="relative flex h-[25%] items-center justify-center px-4 text-center"
          style={{
            background: typeConfig.headerBg,
            color: typeConfig.headerText,
          }}
        >
          <img
            src={logoSrc || logoKasepuhan}
            alt="Logo kiri"
            className="absolute left-4 top-1/2 h-[48px] w-[48px] -translate-y-1/2 object-contain"
          />

          <div className="px-[64px]">
            <h2 className="text-[15px] font-bold leading-tight tracking-wide uppercase">
              {titleText}
            </h2>

            <p className="mt-1 text-[10px] font-semibold leading-snug">
              Padepokan Pesantren Perguruan Pencak Silat
              <br />
              dan Lingkungan Seni Padjadjaran Pusat
            </p>
          </div>

          <img
            src={defaultLogo}
            alt="Logo kanan"
            className="bg-white rounded-full absolute right-4 top-1/2 h-[48px] w-[48px] -translate-y-1/2 object-contain"
          />
        </div>

        {/* Body */}
        <div className="relative h-[75%] overflow-hidden bg-[#EEF1F4] px-4 py-3 text-black">
          {/* Soft background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-14 top-0 h-44 w-44 rotate-45 bg-white/60" />
            <div className="absolute left-28 top-7 h-40 w-40 rotate-45 bg-white/35" />
            <div className="absolute bottom-[-55px] right-[-35px] h-52 w-52 rotate-45 bg-white/55" />
            <div className="absolute right-20 top-[-55px] h-36 w-36 rotate-45 bg-white/35" />
          </div>

          {/* Main content */}
          <div className="relative z-10 grid grid-cols-[90px_1fr] gap-4">
            <div className="h-[114px] w-[90px] overflow-hidden bg-gray-200">
              {photoUrl ? (
                <img
                  src={photoUrl.startsWith('http') ? photoUrl : `${API_URL}${photoUrl}`}
                  alt={fullName || 'Foto anggota'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-[10px] font-medium text-gray-500">
                  Foto
                  <br />
                  Anggota
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-[6px] pt-1">
              <InfoRow label="No. KTA" value={ktaNumber || '-'} strong />
              <InfoRow label="Nama" value={fullName || '-'} strong />
              <InfoRow label="TTL" value={ttl || '-'} />
              <InfoRow label="Wilayah" value={wilayahName || '-'} />
              <InfoRow label="Alamat" value={address || '-'} isLong />
              <InfoRow label="Jatuh Tempo" value={finalExpiryDate || '-'} />
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div
                className="mb-1 inline-flex rounded-full px-3 py-0.5 text-[10.5px] font-semibold"
                style={{
                  background: typeConfig.headerBg,
                  color: typeConfig.headerText,
                }}
              >
                Sekretariat Pusat:
              </div>

              <p className="max-w-[285px] text-[9.5px] font-medium leading-snug text-black">
                Jl. Raya Karangnunggal KM. 21 Adawarna Sukaraja
                <br />
                TASIKMALAYA - <span className="font-semibold">JAWA BARAT</span>
              </p>
            </div>

            <div className="flex shrink-0 items-end gap-2">
              <div className="h-[50px] w-px bg-black/50" />

              <div className="text-center">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="QR Code KTA"
                    className="h-[48px] w-[48px] object-contain"
                  />
                ) : (
                  <DummyQr />
                )}

                <p className="mt-0.5 text-[5px] font-medium text-gray-700">
                  www.padjadjaran.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({
  label,
  value,
  isLong = false,
  strong = false,
}: {
  label: string;
  value: string;
  isLong?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[65px_10px_1fr] items-start text-[10px] leading-snug text-black">
      <span className="font-semibold">{label}</span>
      <span className="text-center font-semibold">:</span>
      <span
        className={[
          isLong ? 'line-clamp-2 leading-tight' : 'truncate',
          strong ? 'font-bold text-[11px]' : 'font-medium',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function getCardTitle(memberType?: string, ktaNumber?: string) {
  const value = `${memberType || ''} ${ktaNumber || ''}`.toLowerCase();

  if (
    value.includes('admin') ||
    value.includes('pengurus') ||
    value.includes('pusat') ||
    value.includes('wilayah')
  ) {
    return 'KARTU TANDA PENGURUS';
  }

  return 'KARTU TANDA ANGGOTA';
}

function getMemberTypeConfig(memberType?: string) {
  const type = normalizeMemberType(memberType).toLowerCase();

  if (type === 'umum') {
    return {
      headerBg: '#000000',
      headerText: '#FFFFFF',
      badgeBg: '#000000',
      badgeText: '#FFFFFF',
    };
  }

  if (type === 'khusus') {
    return {
      headerBg: '#EAB308', // Yellow
      headerText: '#000000',
      badgeBg: '#EAB308',
      badgeText: '#000000',
    };
  }

  if (type === 'pencak silat') {
    return {
      headerBg: '#DC2626', // Red
      headerText: '#FFFFFF',
      badgeBg: '#DC2626',
      badgeText: '#FFFFFF',
    };
  }

  return {
    headerBg: '#000000',
    headerText: '#FFFFFF',
    badgeBg: '#000000',
    badgeText: '#FFFFFF',
  };
}

function normalizeMemberType(memberType?: string) {
  const value = String(memberType || 'Umum').trim().toLowerCase();

  if (value.includes('pencak') || value.includes('silat')) return 'Pencak Silat';
  if (value.includes('khusus')) return 'Khusus';
  if (value.includes('umum')) return 'Umum';

  return memberType || 'Umum';
}

function getExpiryDate({
  approvedAt,
  registeredAt,
}: {
  approvedAt?: string;
  registeredAt?: string;
}) {
  const sourceDate = approvedAt || registeredAt;

  if (!sourceDate) return '-';

  const date = parseIndonesianDate(sourceDate);

  if (!date) return '-';

  date.setFullYear(date.getFullYear() + 2);

  return formatDateLong(date.toISOString());
}

function parseIndonesianDate(dateValue?: string): Date | null {
  if (!dateValue) return null;

  const nativeDate = new Date(dateValue);

  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const monthMap: Record<string, number> = {
    januari: 0,
    jan: 0,
    februari: 1,
    feb: 1,
    maret: 2,
    mar: 2,
    april: 3,
    apr: 3,
    mei: 4,
    juni: 5,
    jun: 5,
    juli: 6,
    jul: 6,
    agustus: 7,
    agt: 7,
    ags: 7,
    september: 8,
    sep: 8,
    oktober: 9,
    okt: 9,
    november: 10,
    nov: 10,
    desember: 11,
    des: 11,
  };

  const clean = dateValue.toLowerCase().replace(/,/g, '').trim();
  const parts = clean.split(/\s+/);

  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = monthMap[parts[1]];
    const year = Number(parts[2]);

    if (!Number.isNaN(day) && month !== undefined && !Number.isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  return null;
}

function formatDateLong(dateValue?: string) {
  if (!dateValue) return '';

  const date = parseIndonesianDate(dateValue);

  if (!date) return dateValue;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function DummyQr() {
  return (
    <svg
      className="h-[48px] w-[48px] text-black"
      viewBox="0 0 25 25"
      shapeRendering="crispEdges"
    >
      <rect width="25" height="25" fill="white" />

      <rect x="0" y="0" width="7" height="7" fill="black" />
      <rect x="1" y="1" width="5" height="5" fill="white" />
      <rect x="2" y="2" width="3" height="3" fill="black" />

      <rect x="18" y="0" width="7" height="7" fill="black" />
      <rect x="19" y="1" width="5" height="5" fill="white" />
      <rect x="20" y="2" width="3" height="3" fill="black" />

      <rect x="0" y="18" width="7" height="7" fill="black" />
      <rect x="1" y="19" width="5" height="5" fill="white" />
      <rect x="2" y="20" width="3" height="3" fill="black" />

      <rect x="9" y="1" width="1" height="3" fill="black" />
      <rect x="11" y="0" width="2" height="1" fill="black" />
      <rect x="14" y="2" width="2" height="2" fill="black" />
      <rect x="9" y="9" width="3" height="1" fill="black" />
      <rect x="10" y="11" width="1" height="3" fill="black" />
      <rect x="13" y="10" width="2" height="1" fill="black" />
      <rect x="15" y="8" width="1" height="4" fill="black" />
      <rect x="1" y="9" width="4" height="1" fill="black" />
      <rect x="3" y="11" width="2" height="2" fill="black" />
      <rect x="5" y="14" width="2" height="1" fill="black" />
      <rect x="21" y="9" width="2" height="1" fill="black" />
      <rect x="19" y="11" width="3" height="2" fill="black" />
      <rect x="23" y="14" width="2" height="1" fill="black" />
      <rect x="9" y="19" width="2" height="2" fill="black" />
      <rect x="11" y="22" width="1" height="3" fill="black" />
      <rect x="14" y="20" width="3" height="2" fill="black" />
      <rect x="21" y="21" width="2" height="2" fill="black" />
    </svg>
  );
}

export default KTACard;
