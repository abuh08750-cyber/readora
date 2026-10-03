'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    refundedOrders: 0
  })
  const [orders, setOrders] = useState<any[]>([])
  const [topSelling, setTopSelling] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Filters & State
  const [rangeFilter, setRangeFilter] = useState<'Today' | '7 Days' | '30 Days' | '12 Months'>('30 Days')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [methodFilter, setMethodFilter] = useState('All Payment Methods')
  const [dateFilter, setDateFilter] = useState('All Dates')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        window.location.href = '/?auth=required&redirect=/admin/orders'
        return
      }
      loadOrdersData()
    })
  }, [rangeFilter])

  async function loadOrdersData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders?range=${rangeFilter}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setOrders(data.orders)
        setTopSelling(data.topSellingBooks)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Filtered Orders Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const s = searchQuery.toLowerCase()
      const matchSearch =
        (o.order_id || '').toLowerCase().includes(s) ||
        (o.customer_name || '').toLowerCase().includes(s) ||
        (o.customer_email || '').toLowerCase().includes(s) ||
        (o.book_title || '').toLowerCase().includes(s) ||
        (o.payment_id || '').toLowerCase().includes(s)

      const matchStatus =
        statusFilter === 'All Status' ||
        (o.status || '').toLowerCase() === statusFilter.toLowerCase()

      const matchMethod =
        methodFilter === 'All Payment Methods' ||
        (o.payment_method || '').toLowerCase() === methodFilter.toLowerCase()

      return matchSearch && matchStatus && matchMethod
    })
  }, [orders, searchQuery, statusFilter, methodFilter])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1
  const displayedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage])

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Export karne ke liye koi orders nahi hain.')
      return
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Book Title', 'Amount (INR)', 'Payment Method', 'Gateway', 'Payment ID', 'Status', 'Date']
    const rows = filteredOrders.map(o => [
      `"${o.order_id || o.id}"`,
      `"${o.customer_name || 'Reader'}"`,
      `"${o.customer_email || ''}"`,
      `"${o.book_title || ''}"`,
      o.amount,
      `"${o.payment_method || 'UPI'}"`,
      `"${o.payment_gateway || 'Razorpay'}"`,
      `"${o.payment_id || ''}"`,
      `"${o.status || 'paid'}"`,
      `"${new Date(o.created_at).toLocaleString('en-IN')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Readora_Orders_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050a15', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. Left Sidebar Navigation */}
      <aside style={{ width: '230px', background: '#070d1d', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '22px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '800', marginBottom: '28px', paddingLeft: '8px', cursor: 'pointer' }}>
            <span>📖</span>
            <span style={{ letterSpacing: '-0.3px' }}>READORA</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/admin'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>🏠</span> Dashboard
            </div>
            <div onClick={() => window.location.href = '/admin#books-section'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>📚</span> Books
            </div>
            <div onClick={() => window.location.href = '/admin#add-book-section'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>➕</span> Add Book
            </div>
            <div onClick={() => window.location.href = '/categories'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>🏷️</span> Categories
            </div>
            <div onClick={() => window.location.href = '/library'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>👥</span> Users
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              <span>🛒</span> Orders & Sales
            </div>
            <div onClick={() => window.location.href = '/admin'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>📊</span> Analytics
            </div>
            <div onClick={() => window.location.href = '/settings'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>⚙️</span> Settings
            </div>
          </nav>
        </div>

        <div style={{ background: '#0b1428', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '14px', padding: '14px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>👑</span> Admin Panel
          </div>
          <span style={{ color: '#94a3b8' }}>Manage your library and platform.</span>
        </div>
      </aside>

      {/* 2. Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Search & Admin Navbar */}
        <header style={{ padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070d1d', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0a1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '6px 14px', width: '380px' }}>
            <span style={{ color: '#94a3b8', marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search orders, users, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ fontSize: '16px', cursor: 'pointer' }}>☀️</span>
            <span style={{ fontSize: '16px', cursor: 'pointer' }}>🔔 <sup style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '1px 4px', fontSize: '9px' }}>3</sup></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/admin'}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                A
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Admin ▾</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ padding: '28px 32px 60px' }}>
          
          {/* Header Title & Export Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Orders & Sales</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Manage purchases, payments and sales of your eBooks.</p>
            </div>
            <button
              onClick={handleExportCSV}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              <span>📥</span> Export Orders
            </button>
          </div>

          {/* 5 Statistics Top Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {/* 1. Total Sales */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(37,99,235,0.2)', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>💰</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Total Sales</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                ₹{stats.totalSales.toLocaleString()}
              </div>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>↑ 22% <span style={{ color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
            </div>

            {/* 2. Total Orders */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(56,189,248,0.2)', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>🛒</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Total Orders</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                {stats.totalOrders}
              </div>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>↑ 18% <span style={{ color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
            </div>

            {/* 3. Paid Orders */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Paid Orders</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                {stats.paidOrders}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Successful payments</span>
            </div>

            {/* 4. Pending Orders */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(245,158,11,0.2)', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>⏳</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Pending Orders</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                {stats.pendingOrders}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Awaiting payment</span>
            </div>

            {/* 5. Refunded */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(168,85,247,0.2)', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>↩️</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Refunded</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                {stats.refundedOrders}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Refunded orders</span>
            </div>
          </div>

          {/* Main Grid: Sales Overview Graph & Order Details / Top Selling Books */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            
            {/* Left Area: Sales Overview Graph */}
            <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800' }}>Sales Overview</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Track your revenue and order performance.</p>
                </div>
                {/* Time Filters */}
                <div style={{ display: 'flex', background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px' }}>
                  {(['Today', '7 Days', '30 Days', '12 Months'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setRangeFilter(p)}
                      style={{
                        background: rangeFilter === p ? '#2563eb' : 'transparent',
                        color: rangeFilter === p ? '#fff' : '#94a3b8',
                        border: 'none',
                        padding: '5px 12px',
                        borderRadius: '7px',
                        fontSize: '11px',
                        fontWeight: rangeFilter === p ? 'bold' : 'normal',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visual + Mini Stat Cards */}
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                {/* Responsive SVG Smooth Area Chart */}
                <div style={{ flex: 1, height: '170px', position: 'relative' }}>
                  <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.05)" />

                    {/* Area fill */}
                    <path
                      d="M 10 135 C 70 120, 110 130, 150 110 C 200 85, 230 115, 280 90 C 330 65, 370 70, 420 40 C 450 20, 480 30, 490 20 L 490 140 L 10 140 Z"
                      fill="url(#areaGradient)"
                    />
                    {/* Line curve */}
                    <path
                      d="M 10 135 C 70 120, 110 130, 150 110 C 200 85, 230 115, 280 90 C 330 65, 370 70, 420 40 C 450 20, 480 30, 490 20"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.8"
                    />

                    {/* Active dots */}
                    <circle cx="150" cy="110" r="3.5" fill="#38bdf8" />
                    <circle cx="280" cy="90" r="3.5" fill="#38bdf8" />
                    <circle cx="420" cy="40" r="3.5" fill="#38bdf8" />
                    <circle cx="490" cy="20" r="4.5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  </svg>

                  {/* Dates X-Axis labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                    <span>Sep 3</span>
                    <span>Sep 8</span>
                    <span>Sep 13</span>
                    <span>Sep 18</span>
                    <span>Sep 23</span>
                    <span>Sep 28</span>
                    <span>Oct 2</span>
                  </div>
                </div>

                {/* 2 Right Mini Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '130px' }}>
                  <div style={{ background: '#060c1d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', marginBottom: '2px' }}>
                      <span>📈</span> Revenue
                    </div>
                    <b style={{ fontSize: '15px', color: '#fff' }}>₹{stats.totalSales.toLocaleString()}</b>
                  </div>

                  <div style={{ background: '#060c1d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', marginBottom: '2px' }}>
                      <span>🛒</span> Orders
                    </div>
                    <b style={{ fontSize: '15px', color: '#fff' }}>{stats.totalOrders}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Area: Dynamic Top Selling Books & Live Drawer Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Order Details Drawer (If clicked) */}
              {selectedOrder ? (
                <div style={{ background: '#091024', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <b style={{ fontSize: '14px', color: '#fff' }}>Order Details</b>
                    <span onClick={() => setSelectedOrder(null)} style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</span>
                  </div>

                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Order ID:</span> <b style={{ color: '#38bdf8' }}>{selectedOrder.order_id || `#RD${selectedOrder.id?.slice(0, 4)}`}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Customer:</span> <span style={{ color: '#fff' }}>{selectedOrder.customer_name || 'Reader'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Email:</span> <span style={{ color: '#94a3b8' }}>{selectedOrder.customer_email || 'customer@example.com'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Book:</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.book_title || 'eBook'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Price:</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{selectedOrder.amount}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Payment Method:</span> <span style={{ color: '#cbd5e1' }}>{selectedOrder.payment_method || 'UPI'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Gateway:</span> <span style={{ color: '#cbd5e1' }}>{selectedOrder.payment_gateway || 'Razorpay'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Payment ID:</span> <span style={{ color: '#94a3b8', fontSize: '10px' }}>{selectedOrder.payment_id || 'pay_xxxxxxxxx'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                        ✓ {selectedOrder.status || 'Paid'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    style={{ width: '100%', marginTop: '14px', background: '#0c162d', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)', padding: '7px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    Close
                  </button>
                </div>
              ) : null}

              {/* Top Selling Books Card */}
              <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
                <b style={{ fontSize: '14px', color: '#fff', display: 'block', marginBottom: '14px' }}>Top Selling Books</b>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(topSelling.length > 0 ? topSelling : [
                    { title: 'ZERO SE ARTIST Part 1', purchases: 42, revenue: 8358 },
                    { title: 'The Silent River', purchases: 18, revenue: 2682 },
                    { title: 'Mindset Matters', purchases: 15, revenue: 1485 },
                    { title: 'Code & Create', purchases: 11, revenue: 2189 },
                    { title: 'The Lost Kingdom', purchases: 8, revenue: 1192 },
                  ]).map((item: any, i: number) => (
                    <div key={item.title || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{i + 1}</span>
                        <div>
                          <b style={{ fontSize: '12px', color: '#fff', display: 'block', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </b>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{item.purchases} purchases</span>
                        </div>
                      </div>
                      <b style={{ fontSize: '11px', color: '#10b981' }}>₹{item.revenue.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Orders Section Table */}
          <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Orders</h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>View and manage all customer purchases.</p>
              </div>

              {/* 3 Dropdown Filters + Search */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 12px', width: '200px' }}>
                  <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '11px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '11px', width: '100%' }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 10px', color: '#fff', fontSize: '11px', outline: 'none' }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 10px', color: '#fff', fontSize: '11px', outline: 'none' }}
                >
                  <option value="All Payment Methods">All Payment Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Wallet">Wallet</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 10px', color: '#fff', fontSize: '11px', outline: 'none' }}
                >
                  <option value="All Dates">Date</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                    <th style={{ padding: '12px 8px' }}>Order ID</th>
                    <th style={{ padding: '12px 8px' }}>Customer</th>
                    <th style={{ padding: '12px 8px' }}>Book</th>
                    <th style={{ padding: '12px 8px' }}>Amount</th>
                    <th style={{ padding: '12px 8px' }}>Payment Method</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Date</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        No orders found matching filters.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((ord: any) => {
                      const status = (ord.status || 'paid').toLowerCase()
                      const isPaid = status === 'paid'
                      const isPending = status === 'pending'
                      const isRefunded = status === 'refunded'

                      return (
                        <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '14px 8px', color: '#38bdf8', fontWeight: 'bold' }}>
                            {ord.order_id || `#RD${ord.id?.slice(0, 4)}`}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#fff', fontWeight: '500' }}>
                            {ord.customer_name || 'Abu Huzaifa'}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#cbd5e1' }}>
                            {ord.book_title || 'ZERO SE ARTIST Part 1'}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#fff', fontWeight: 'bold' }}>
                            ₹{ord.amount}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#94a3b8' }}>
                            {ord.payment_method || 'UPI'}
                          </td>
                          <td style={{ padding: '14px 8px' }}>
                            {isPaid && (
                              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                                ✓ Paid
                              </span>
                            )}
                            {isPending && (
                              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                                + Pending
                              </span>
                            )}
                            {isRefunded && (
                              <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                                ↩ Refunded
                              </span>
                            )}
                            {!isPaid && !isPending && !isRefunded && (
                              <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                                ✕ Failed
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#64748b' }}>
                            {new Date(ord.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '15px' }}
                              title="View Order Details"
                            >
                              👁
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#64748b' }}>
              <span>
                Showing {Math.min(1, filteredOrders.length)}–{Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    style={{
                      background: currentPage === num ? '#2563eb' : '#050a15',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: currentPage === num ? 'bold' : 'normal',
                    }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                  ›
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
                         }
