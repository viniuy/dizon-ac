'use client'

import { useEffect, useRef } from 'react'

// Bambang, Taguig, Philippines
const HQ_COORDS: [number, number] = [ 121.07130099029925, 14.526719911696956]

/** Create a GeoJSON polygon approximating a circle */
function makeCircleGeoJSON(
  center: [number, number],
  radiusKm: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center
  const distX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distY = radiusKm / 110.574
  const coords: [number, number][] = []

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * 2 * Math.PI
    coords.push([lng + distX * Math.cos(theta), lat + distY * Math.sin(theta)])
  }
  coords.push(coords[0])

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
}

const COVERAGE_CITIES = [
  'Taguig City', 'Makati', 'Pateros', 'Pasig',
  'Mandaluyong', 'Parañaque', 'Muntinlupa',
]

export function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Using unknown avoids TypeScript errors when mapbox-gl isn't installed yet.
  // The map instance is only accessed via its own .remove() method on cleanup.
  const mapRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    async function init() {
      const mapboxgl = (await import('mapbox-gl')).default

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) {
        console.warn('Mapbox token missing — set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local')
        return
      }
      if (!containerRef.current) return

      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: HQ_COORDS,
        zoom: 10,
        interactive: true,
        attributionControl: false,
        logoPosition: 'bottom-right',
      })

      mapRef.current = map

      map.on('load', () => {
        /* ── Service area circle ─────────────────────── */
        map.addSource('service-area', {
          type: 'geojson',
          data: makeCircleGeoJSON(HQ_COORDS, 15),
        })

        map.addLayer({
          id: 'service-area-fill',
          type: 'fill',
          source: 'service-area',
          paint: {
            'fill-color': '#38bdf8',
            'fill-opacity': 0.06,
          },
        })

        map.addLayer({
          id: 'service-area-line',
          type: 'line',
          source: 'service-area',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 1.5,
            'line-opacity': 0.35,
            'line-dasharray': [4, 3],
          },
        })

        /* ── HQ marker ───────────────────────────────── */
        const el = document.createElement('div')
        el.style.cssText = `
          width: 20px; height: 20px; border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 0 5px rgba(56,189,248,0.2), 0 0 20px rgba(56,189,248,0.5);
          cursor: default;
        `

        // Pulse ring
        const ring = document.createElement('div')
        ring.style.cssText = `
          position: absolute; inset: -8px; border-radius: 50%;
          border: 1.5px solid rgba(56,189,248,0.4);
          animation: dac-ping 2s ease-out infinite;
        `
        el.appendChild(ring)
        el.style.position = 'relative'

        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(HQ_COORDS)
          .addTo(map)
      })
    }

    init()

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  return (
    <section
      id="map"
      className="relative z-[1]"
      style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
    >
      <div className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)] py-[clamp(5rem,10vh,8rem)]">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10 items-center">

          {/* ── Left: info ───────────────────────────────── */}
          <div>
            <p className="section-eyebrow">Where we are</p>
            <h2
              className="font-syne font-extrabold tracking-[-0.035em] leading-[1.05] text-dac-text mb-4"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
            >
              Based in Bambang,{' '}
              <span className="text-dac-accent">Taguig City</span>
            </h2>
            <p className="text-dac-muted font-figtree leading-[1.75] mb-7 text-sm">
              We serve homes and businesses across Metro Manila and nearby areas.
              Most jobs are same-day or next-day. Call us and we'll confirm your schedule.
            </p>

            {/* Coverage chips */}
            <div className="mb-7">
              <p className="text-dac-dim text-xs font-syne font-semibold uppercase tracking-[0.12em] mb-3">
                Service Areas Include
              </p>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_CITIES.map(city => (
                  <span
                    key={city}
                    className="text-xs font-figtree px-2.5 py-1 rounded-full text-dac-muted"
                    style={{
                      background: 'var(--dac-card-dense)',
                      border: '1px solid rgba(56,189,248,0.12)',
                    }}
                  >
                    {city}
                  </span>
                ))}
                <span
                  className="text-xs font-figtree px-2.5 py-1 rounded-full text-dac-accent"
                  style={{
                    background: 'rgba(56,189,248,0.08)',
                    border: '1px solid rgba(56,189,248,0.2)',
                  }}
                >
                  + more
                </span>
              </div>
            </div>

            {/* Address card */}
            <div
              className="flex items-start gap-3 rounded-[14px] p-4"
              style={{
                background: 'var(--dac-card-dense)',
                border: '1px solid rgba(56,189,248,0.12)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-dac-accent flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(56,189,248,0.1)' }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="text-dac-text text-sm font-semibold font-syne">Bambang, Taguig City</p>
                <p className="text-dac-dim text-xs font-figtree mt-0.5">
                  National Capital Region, Philippines
                </p>
                <a
                  href="https://maps.google.com/?q=Bambang+Taguig+Philippines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dac-accent text-xs font-figtree mt-1 inline-flex items-center gap-1 hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* ── Right: Mapbox map ──────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{
              height: 'clamp(300px, 45vw, 480px)',
              borderRadius: 20,
              border: '1px solid rgba(56,189,248,0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div ref={containerRef} className="w-full h-full" />

            {/* Fallback for missing token */}
            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{
                  background: 'var(--dac-card-solid)',
                  backgroundImage:
                    'linear-gradient(rgba(56,189,248,0.04) 1px,transparent 1px),' +
                    'linear-gradient(90deg,rgba(56,189,248,0.04) 1px,transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-dac-dim" fill="none"
                     stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div className="text-center">
                  <p className="text-dac-muted text-sm font-syne font-semibold">Bambang, Taguig</p>
                  <p className="text-dac-dim text-xs mt-1 font-figtree">
                    Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
                  </p>
                </div>
              </div>
            )}

            {/* Map overlay: HQ label */}
            <div
              className="absolute top-4 left-4 flex items-center gap-2 rounded-lg px-3 py-1.5 pointer-events-none"
              style={{
                background: 'var(--dac-map-overlay)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(56,189,248,0.2)',
              }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full bg-dac-accent"
                style={{ boxShadow: '0 0 6px #38bdf8' }}
              />
              <span className="text-dac-text text-xs font-syne font-semibold">Dizon AC HQ</span>
            </div>
          </div>

        </div>
      </div>

      {/* Keyframe for marker pulse */}
      <style>{`
        @keyframes dac-ping {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0;   }
        }
      `}</style>
    </section>
  )
}
