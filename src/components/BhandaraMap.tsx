'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import Link from 'next/link';
import { INDORE_CENTER } from '@/lib/indore-areas';
import {
  getBhandaraDetailPath,
  getBhandaraStatus,
  getDistanceKm,
  getGoogleMapsUrl,
  getStatusLabel,
} from '@/lib/geo';
import { Bhandara } from '@/lib/types';

function makeMarkerIcon(isLive: boolean, isVerified: boolean) {
  const color = isLive ? '#DC2626' : '#EA580C';
  const badge = isVerified ? '✓' : '🍛';
  return L.divIcon({
    className: 'nukti-map-marker',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
      ${
        isLive
          ? `<span style="position:absolute;inset:-4px;border-radius:9999px;background:rgba(220,38,38,0.35);animation:pulse-ring 1.8s infinite;"></span>`
          : ''
      }
      <div style="width:34px;height:34px;border-radius:9999px;background:${color};border:3px solid #FFFBEB;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:15px;font-weight:800;">
        ${badge}
      </div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

const userIcon = L.divIcon({
  className: 'nukti-user-marker',
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:#2563EB;border:3px solid white;box-shadow:0 0 0 6px rgba(37,99,235,0.25);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface BhandaraMapProps {
  bhandaras: Bhandara[];
  userLocation: { lat: number; lng: number } | null;
  heightClass?: string;
}

export function BhandaraMap({
  bhandaras,
  userLocation,
  heightClass = 'h-[500px]',
}: BhandaraMapProps) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : INDORE_CENTER;

  return (
    <div
      className={`overflow-hidden rounded-3xl border-2 border-orange-200 bg-orange-50 shadow-md ${heightClass}`}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <RecenterMap center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs font-bold text-blue-800">
                📍 Aap Yahan Hain
              </div>
            </Popup>
          </Marker>
        )}

        {bhandaras.map((b) => {
          const status = getBhandaraStatus(b);
          const statusInfo = getStatusLabel(b);
          const dist = userLocation
            ? getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
            : null;
          return (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              icon={makeMarkerIcon(status === 'live', b.isVerified)}
            >
              <Popup minWidth={220}>
                <div className="space-y-2 p-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white ${
                        status === 'live'
                          ? 'bg-red-600'
                          : status === 'upcoming'
                          ? 'bg-amber-500'
                          : 'bg-stone-600'
                      }`}
                    >
                      {statusInfo.badgeText}
                    </span>
                    {typeof dist === 'number' && (
                      <span className="text-[11px] font-bold text-orange-800">
                        {dist} km
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-[#431407] leading-snug">
                    {b.title}
                  </h4>
                  <p className="text-xs text-stone-600">
                    📍 {b.area} — {b.landmark}
                  </p>
                  <p className="text-xs font-semibold text-orange-800">
                    🍽️ {b.foodItems.join(', ')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getGoogleMapsUrl(b.lat, b.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-orange-600 px-2.5 py-1.5 text-center text-xs font-bold text-white"
                    >
                      🧭 Raasta
                    </a>
                    <Link
                      href={getBhandaraDetailPath(b)}
                      className="flex-1 rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-center text-xs font-bold text-[#431407]"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
