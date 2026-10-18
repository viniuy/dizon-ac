'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { COVERAGE } from './landing.data'

/** Roughly the distance to the farthest listed city (Muntinlupa ≈ 13 km) */
const COVERAGE_RADIUS_M = 14_000

/**
 * OpenStreetMap via Leaflet. Leaflet touches `window`, so it is imported inside
 * the effect. Wheel zoom is off so page scrolling never gets trapped by the map;
 * on touch devices one-finger drag is off too (use the zoom buttons / pinch).
 */
export function CoverageMap() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: import('leaflet').Map | undefined
    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !ref.current) return
      const [home, ...cities] = COVERAGE
      const touch = window.matchMedia('(pointer: coarse)').matches

      map = L.map(ref.current, {
        center: [home.lat, home.lng],
        zoom: 12,
        scrollWheelZoom: false,
        dragging: !touch,
        zoomControl: false,
        attributionControl: true,
      })
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      L.circle([home.lat, home.lng], {
        radius: COVERAGE_RADIUS_M,
        color: '#1f6fd1',
        weight: 1.5,
        dashArray: '6 6',
        fillColor: '#4696ef',
        fillOpacity: 0.08,
      }).addTo(map)

      // City dots stay quiet; names show on hover / tap (the list beside the map names them all)
      cities.forEach(({ city, lat, lng }) => {
        L.marker([lat, lng], {
          title: city,
          icon: L.divIcon({ className: 'dac-map-pin', iconSize: [16, 16], html: '<span class="dac-map-dot"></span>' }),
        })
          .bindTooltip(city, { direction: 'top', offset: [0, -10], className: 'dac-map-tip' })
          .addTo(map!)
      })

      L.marker([home.lat, home.lng], {
        title: 'Dizon Aircon — Bambang, Taguig',
        zIndexOffset: 1000,
        icon: L.divIcon({
          className: 'dac-map-pin',
          iconSize: [0, 0],
          html: `<span class="dac-map-home"><span class="dac-map-pulse"></span></span><span class="dac-map-label dac-map-label--home">Dizon · Bambang, Taguig</span>`,
        }),
      }).addTo(map)

      map.fitBounds(L.latLngBounds(COVERAGE.map(c => [c.lat, c.lng])), { padding: [48, 48] })
    })

    return () => {
      cancelled = true
      map?.remove()
    }
  }, [])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Map of Dizon's service area around Bambang, Taguig"
      className="dac-map relative z-0 h-[380px] w-full overflow-hidden rounded-[18px] border border-black/[0.06] bg-dac-mist shadow-[0_30px_70px_-35px_rgb(15_40_80/0.35)] sm:h-[460px]"
    />
  )
}
