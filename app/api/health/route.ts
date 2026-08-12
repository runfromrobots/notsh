import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Environment variables not configured',
          url: supabaseUrl ? 'configured' : 'missing',
          key: supabaseKey ? 'configured' : 'missing',
        },
        { status: 500 }
      )
    }

    // Test Supabase connection with a simple select
    console.log('Testing Supabase connection...')
    const { data, error, status } = await supabase
      .from('games')
      .select('id')
      .limit(1)

    console.log('Query result:', { data, error, status })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        toString: error.toString(),
      })
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase query failed',
          error: error.message || 'Unknown error',
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl,
      gameCount: data?.length || 0,
      queryStatus: status,
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}
