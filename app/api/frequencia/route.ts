// LOCALIZAÇÃO: app/api/aulas/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'ok' })
}