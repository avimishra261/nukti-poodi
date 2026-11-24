'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

const pinIcon = L.divIcon({
  className: 'nukti-pin-marker',
  html: `<div style="width:36px;height:36px;border-radius:9999px;background:#EA580C;border:3px solid #FFFBEB;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(
        Math.round(e.latlng.lat * 100000) / 100000,
        Math.round(e.latlng.lng * 100000) / 100000
      );
    },
  });
  return null;
}

function SyncCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
  heightClass?: string;
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  interactive = true,
  heightClass = 'h-60',
}: LocationPickerMapProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50 ${heightClass}`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={interactive}
        className="h-full w-full"
      >
        <SyncCenter lat={lat} lng={lng} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {interactive && onChange && <MapClickHandler onSelect={onChange} />}
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
