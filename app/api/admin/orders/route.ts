import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30'

    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersErr) {
      return NextResponse.json({ error: ordersErr.message }, { status: 500 })
    }

    const orders = ordersData || []

    const paidOrders = orders.filter(o => o.status?.toLowerCase() === 'paid')
    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending')
    const refundedOrders = orders.filter(o => o.status?.toLowerCase() === 'refunded')

    const totalPaidAmount = paidOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    const totalRefundedAmount = refundedOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    const netTotalSales = Math.max(0, totalPaidAmount - totalRefundedAmount)

    const bookMap: Record<string, { title: string; cover: string; purchases: number; revenue: number }> = {}
    paidOrders.forEach(o => {
      const bId = o.book_id || 'unknown'
      if (!bookMap[bId]) {
        bookMap[bId] = {
          title: o.book_title || 'eBook Title',
          cover: o.book_cover || '',
          purchases: 0,
          revenue: 0
        }
      }
      bookMap[bId].purchases += 1
      bookMap[bId].revenue += Number(o.amount) || 0
    })

    const topSellingBooks = Object.values(bookMap)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      stats: {
        totalSales: netTotalSales,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: pendingOrders.length,
        refundedOrders: refundedOrders.length
      },
      orders,
      topSellingBooks
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
      }
                                   
