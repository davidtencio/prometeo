import { NextResponse } from 'next/server'

export function jsonError(message: string, status = 500, details?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function jsonSuccess<T>(payload: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...payload,
    },
    { status }
  )
}
