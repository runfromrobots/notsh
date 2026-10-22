import { NextResponse } from 'next/server'
import { sendSignupAlert } from '@/lib/signupAlert'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: { email?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real people never see the "website" field
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'That email doesn’t look quite right.' }, { status: 400 })
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'The list isn’t open just yet. Try again soon.' }, { status: 503 })
  }

  const { error } = await supabase.from('mailing_list').insert({ email })

  // 23505 = unique violation: already on the list, which is fine
  if (error && error.code !== '23505') {
    console.error('[notify] insert failed:', error.message)
    return NextResponse.json({ error: 'Something went sideways. Please try again.' }, { status: 500 })
  }

  // Only brand-new sign-ups trigger an alert; repeats were already announced
  if (!error) {
    await sendSignupAlert(email)
  }

  return NextResponse.json({ ok: true })
}
