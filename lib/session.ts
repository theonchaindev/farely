import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('farely-session')?.value ?? null
}

export function newSessionId(): string {
  return randomUUID()
}
