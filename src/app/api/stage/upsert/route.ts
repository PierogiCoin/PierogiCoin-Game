// File: src/app/api/stage/upsert/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client'

export const dynamic = 'force-dynamic'

type UpsertBody = {
  id?: number
  name: string
  price: number
  bonus_percent?: number | null
  start_date?: string | null // ISO
  end_date?: string | null   // ISO
  is_active?: boolean | null
  hardcap_usd?: number | null
  // opcjonalne zachowanie: jeśli true i is_active = true, wyłącz inne etapy
  exclusiveActivate?: boolean
}

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noCacheHeaders })
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient()

  let body: UpsertBody
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON body')
  }

  // --- prosta walidacja
  if (!body || typeof body !== 'object') return bad('Missing body')
  if (!body.name || typeof body.name !== 'string') return bad('Field "name" is required')
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) {
    return bad('Field "price" must be a positive number')
  }
  if (
    body.bonus_percent != null &&
    (typeof body.bonus_percent !== 'number' || !Number.isFinite(body.bonus_percent))
  ) {
    return bad('Field "bonus_percent" must be a number if provided')
  }
  if (
    body.hardcap_usd != null &&
    (typeof body.hardcap_usd !== 'number' || !Number.isFinite(body.hardcap_usd) || body.hardcap_usd < 0)
  ) {
    return bad('Field "hardcap_usd" must be a non-negative number if provided')
  }
  if (body.start_date && isNaN(Date.parse(body.start_date))) {
    return bad('Field "start_date" must be an ISO date string if provided')
  }
  if (body.end_date && isNaN(Date.parse(body.end_date))) {
    return bad('Field "end_date" must be an ISO date string if provided')
  }

  // payload do upsertu
  const row = {
    id: body.id, // pozwalamy aktualizować po id jeśli przyjdzie
    name: body.name,
    price: body.price,
    bonus_percent: body.bonus_percent ?? null,
    start_date: body.start_date ?? null,
    end_date: body.end_date ?? null,
    is_active: body.is_active ?? null,
    hardcap_usd: body.hardcap_usd ?? null,
  }

  try {
    // Jeśli prosisz o "exclusive activate": włącz ten etap, resztę wyłącz
    if (body.is_active === true && body.exclusiveActivate) {
      // 1) wyłącz wszystkie aktywne
      const off = await supabase
        .from('presale_stages')
        .update({ is_active: false })
        .eq('is_active', true)
      if (off.error) {
        console.warn('[stage/upsert] Could not deactivate others:', off.error.message)
      }
      // 2) upewnij się, że ten będzie aktywny
      row.is_active = true
    }

    // upsert:
    // - jeśli jest `id`, zaktualizuje po id
    // - jeśli nie ma `id`, ale masz UNIQUE na `name`, użyjemy onConflict: 'name'
    const onConflict = row.id ? undefined : 'name'

    const { data, error } = await supabase
      .from('presale_stages')
      .upsert(row, { onConflict, ignoreDuplicates: false })
      .select('*')
      .limit(1)

    if (error) {
      console.error('[stage/upsert] upsert error:', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500, headers: noCacheHeaders }
      )
    }

    const saved = Array.isArray(data) ? data[0] : data
    return NextResponse.json({ ok: true, stage: saved }, { headers: noCacheHeaders })
  } catch (e: unknown) {
    console.error('[stage/upsert] fatal:', e)
    const msg = e instanceof Error ? e.message : 'Unknown server error';
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500, headers: noCacheHeaders }
    )
  }
}