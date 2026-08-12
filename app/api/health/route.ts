import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('games').select('count', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase connection failed',
          error: error.message,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not configured',
      gameCount: data?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
