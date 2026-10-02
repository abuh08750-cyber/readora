'use client'

import { useState, useEffect } from 'react'

interface WeatherTimeModalProps {
  isOpen: boolean
  onClose: () => void
  themeStyles?: any
}

interface HourlyPoint {
  timeStr: string
  dayStr: string
  temp: number
  isNow?: boolean
}

const PRESET_CITIES = [
  { name: 'Kozhikode, Kerala', lat: 11.2588, lon: 75.7804 },
  { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad, India', lat: 17.3850, lon: 78.4867 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 }
]

export default function WeatherTimeModal({ isOpen, onClose, themeStyles }: WeatherTimeModalProps) {
  // Live Clock State (1 sec interval)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Location & City
  const [cityName, setCityName] = useState('Kozhikode, Kerala')
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 11.2588, lon: 75.7804 })
  const [showCityPicker, setShowCityPicker] = useState(false)

  // Weather States
  const [activeTab, setActiveTab] = useState<'next48' | 'past48'>('next48')
  const [currentTemp, setCurrentTemp] = useState<number | null>(null)
  const [past48, setPast48] = useState<HourlyPoint[]>([])
  const [next48, setNext48] = useState<HourlyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')

  // 1. Live Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Geolocation Detector
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          })
          setCityName('Your Current Location')
        },
        () => {
          // Fallback default city
          setCityName('Kozhikode, Kerala')
          setCoords({ lat: 11.2588, lon: 75.7804 })
        },
        { timeout: 8000 }
      )
    }
  }, [])

  // 3. Fetch Real Past 48h + Next 48h Weather from Open-Meteo
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setWeatherError('')

    async function fetchWeatherData() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m&current_weather=true&past_days=2&forecast_days=3&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Weather API error')
        const data = await res.json()

        if (!isMounted) return

        if (data.current_weather && typeof data.current_weather.temperature === 'number') {
          setCurrentTemp(Math.round(data.current_weather.temperature))
        }

        const times: string[] = data.hourly?.time || []
        const temps: number[] = data.hourly?.temperature_2m || []

        const nowIso = new Date().toISOString().slice(0, 13) // "YYYY-MM-DDTHH"
        let currentIndex = times.findIndex(t => t.startsWith(nowIso))
        if (currentIndex === -1) currentIndex = Math.floor(times.length / 2)

        // Past 48 Hours
        const pastStart = Math.max(0, currentIndex - 48)
        const pastPoints: HourlyPoint[] = []
        for (let i = pastStart; i < currentIndex; i++) {
          const d = new Date(times[i])
          pastPoints.push({
            timeStr: d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
            dayStr: d.toLocaleDateString([], { weekday: 'short' }),
            temp: Math.round(temps[i])
          })
        }
        setPast48(pastPoints)

        // Next 48 Hours
        const nextEnd = Math.min(times.length, currentIndex + 49)
        const nextPoints: HourlyPoint[] = []
        for (let i = currentIndex; i < nextEnd; i++) {
          const d = new Date(times[i])
          nextPoints.push({
            timeStr: i === currentIndex ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
            dayStr: d.toLocaleDateString([], { weekday: 'short' }),
            temp: Math.round(temps[i]),
            isNow: i === currentIndex
          })
        }
        setNext48(nextPoints)
      } catch (err: any) {
        if (isMounted) {
          setWeatherError('Weather data is temporarily unavailable.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchWeatherData()
    return () => {
      isMounted = false
    }
  }, [isOpen, coords])

  if (!isOpen) return null

  const liveTimeString = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const liveDayString = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  const liveDateString = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const cardBg = themeStyles?.card || '#0b1120'
  const innerBg = themeStyles?.inner || '#070b14'
  const borderCol = themeStyles?.border || 'rgba(255, 255, 255, 0.08)'
  const accentCol = themeStyles?.accent || '#38bdf8'
  const textCol = themeStyles?.text || '#f8fafc'
  const mutedCol = themeStyles?.muted || '#94a3b8'

  const activeHourlyList = activeTab === 'next48' ? next48 : past48

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: cardBg,
          border: `1px solid ${borderCol}`,
          borderRadius: '24px',
          padding: '24px 22px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15)',
          color: textCol,
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: mutedCol,
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 6px',
            lineHeight: 1
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>☀️</span>
          <b style={{ fontSize: '16px', letterSpacing: '-0.2px' }}>Live Time & Weather</b>
        </div>

        {/* Current Date, Time & City Card */}
        <div
          style={{
            background: innerBg,
            border: `1px solid ${borderCol}`,
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div
              onClick={() => setShowCityPicker(!showCityPicker)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                marginBottom: '6px',
                color: accentCol,
                fontSize: '12px',
                fontWeight: '600'
              }}
              title="Click to select another city"
            >
              <span>📍 {cityName}</span>
              <span style={{ fontSize: '10px' }}>▾</span>
            </div>

            <div style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
              {liveTimeString}
            </div>

            <div style={{ fontSize: '12px', color: mutedCol, marginTop: '2px' }}>
              {liveDayString}, {liveDateString}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '34px', fontWeight: '900', color: accentCol, lineHeight: 1 }}>
              {currentTemp !== null ? `${currentTemp}°C` : '--'}
            </div>
            <span style={{ fontSize: '11px', color: mutedCol, display: 'block', marginTop: '4px' }}>
              Current Temp
            </span>
          </div>
        </div>

        {/* City Selector Dropdown Menu */}
        {showCityPicker && (
          <div
            style={{
              background: innerBg,
              border: `1px solid ${borderCol}`,
              borderRadius: '12px',
              padding: '8px',
              marginBottom: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '6px'
            }}
          >
            {PRESET_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setCityName(c.name)
                  setCoords({ lat: c.lat, lon: c.lon })
                  setShowCityPicker(false)
                }}
                style={{
                  background: cityName === c.name ? accentCol : 'transparent',
                  color: cityName === c.name ? '#000' : textCol,
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: cityName === c.name ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* 48-Hour Temperature Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🌡️</span>
              <b style={{ fontSize: '13px' }}>Hourly Temperature</b>
            </div>

            {/* Toggle Tabs */}
            <div style={{ display: 'flex', background: innerBg, padding: '3px', borderRadius: '10px', border: `1px solid ${borderCol}` }}>
              <button
                type="button"
                onClick={() => setActiveTab('next48')}
                style={{
                  background: activeTab === 'next48' ? accentCol : 'transparent',
                  color: activeTab === 'next48' ? '#070b14' : mutedCol,
                  border: 'none',
                  borderRadius: '7px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                Next 48h
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past48')}
                style={{
                  background: activeTab === 'past48' ? accentCol : 'transparent',
                  color: activeTab === 'past48' ? '#070b14' : mutedCol,
                  border: 'none',
                  borderRadius: '7px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                Past 48h
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: mutedCol, marginBottom: '8px' }}>
            {activeTab === 'next48' ? 'Upcoming 48 hours forecast' : 'Actual historical records from previous 48 hours'}
            <span style={{ float: 'right' }}>← Scroll horizontally →</span>
          </div>

          {/* Scrollable Hourly Strip */}
          <div
            style={{
              background: innerBg,
              border: `1px solid ${borderCol}`,
              borderRadius: '16px',
              padding: '14px 12px',
              minHeight: '94px',
              boxSizing: 'border-box'
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', color: mutedCol, fontSize: '12px', padding: '24px 0' }}>
                Fetching real-time satellite data...
              </div>
            ) : weatherError ? (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '12px', padding: '20px 0' }}>
                ⚠️ {weatherError}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '6px'
                }}
              >
                {activeHourlyList.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minWidth: '54px',
                      padding: '8px 4px',
                      background: pt.isNow ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: pt.isNow ? `1px solid ${accentCol}` : `1px solid ${borderCol}`,
                      borderRadius: '10px',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '10px', color: mutedCol }}>{pt.dayStr}</span>
                    <span style={{ fontSize: '11px', color: pt.isNow ? accentCol : textCol, fontWeight: '700', margin: '4px 0' }}>
                      {pt.timeStr}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: pt.isNow ? '#fff' : accentCol }}>
                      {pt.temp}°
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '10px', color: mutedCol }}>
          Powered by live open satellite metrics. Time stays in continuous sync.
        </div>
      </div>
    </div>
  )
            }
