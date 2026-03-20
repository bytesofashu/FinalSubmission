import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY.length > 10 && !API_KEY.includes('YOUR_API_KEY');

const DEFAULT_CENTER = { lat: 37.42, lng: -122.08 };

function CardiologistFinder() {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [selected, setSelected] = useState<google.maps.places.Place | null>(null);

  useEffect(() => {
    if (!placesLib || !map) return;

    // Search for cardiologists nearby
    placesLib.Place.searchNearby({
      locationRestriction: { center: map.getCenter() || DEFAULT_CENTER, radius: 5000 },
      includedPrimaryTypes: ['doctor', 'hospital'],
      fields: ['displayName', 'location', 'formattedAddress', 'rating', 'photos'],
      maxResultCount: 10,
    }).then(({ places }) => {
      // Filter for cardiologists if possible, or just show doctors
      setPlaces(places);
    });
  }, [placesLib, map]);

  const handleMarkerClick = useCallback(async (place: google.maps.places.Place) => {
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'rating', 'photos', 'websiteURI'] });
    setSelected(place);
    if (place.location) map?.panTo(place.location);
  }, [map]);

  return (
    <>
      {places.map((place) => (
        <AdvancedMarker
          key={place.id}
          position={place.location}
          onClick={() => handleMarkerClick(place)}
        >
          <Pin background="#ef4444" glyphColor="#fff" />
        </AdvancedMarker>
      ))}

      {selected && selected.location && (
        <InfoWindow position={selected.location} onCloseClick={() => setSelected(null)}>
          <div className="p-2 max-w-[250px]">
            <h3 className="font-bold text-lg mb-1">{selected.displayName}</h3>
            <p className="text-sm text-gray-600 mb-2">{selected.formattedAddress}</p>
            {selected.rating && <p className="text-sm mb-2">⭐ {selected.rating}</p>}
            {selected.photos?.[0] && (
              <img
                src={selected.photos[0].getURI({ maxWidth: 250 })}
                alt={selected.displayName || 'Cardiologist'}
                className="w-full h-32 object-cover rounded mb-2"
                referrerPolicy="no-referrer"
              />
            )}
            {selected.websiteURI && (
              <a
                href={selected.websiteURI}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function HeartMap() {
  if (!hasValidKey) {
    const maskedKey = API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'None';
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            To see nearby cardiologists, you need to add your Google Maps API key.
          </p>
          <div className="text-left bg-white p-6 rounded-xl shadow-sm text-sm space-y-4 mb-6">
            <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener" className="text-blue-500 underline font-medium">Get an API Key</a></p>
            <p><strong>Step 2:</strong> When the <strong>"Enter your environment variable to continue"</strong> popup appears, paste your API key and press <strong>Enter</strong>.</p>
            <p><strong>Step 3:</strong> Or manually: Open <strong>Settings</strong> (⚙️ gear icon, top-right) → <strong>Secrets</strong> → type <code>GOOGLE_MAPS_PLATFORM_KEY</code> → <strong>Enter</strong> → paste key → <strong>Enter</strong>.</p>
          </div>
          <div className="bg-gray-200 p-3 rounded-lg text-[10px] font-mono text-gray-500 break-all">
            <p><strong>Debug Info:</strong></p>
            <p>Key Detected: {API_KEY ? 'Yes' : 'No'}</p>
            <p>Key Value: {maskedKey}</p>
            <p>Length: {API_KEY.length}</p>
            <p>Valid Format: {hasValidKey ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={13}
          mapId="HEART_TWIN_MAP"
          {...({ internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'] } as any)}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={false}
        >
          <CardiologistFinder />
        </Map>
      </APIProvider>
    </div>
  );
}
