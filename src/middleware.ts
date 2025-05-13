import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  // List of protected paths
  const protectedPaths = ['/candidates', '/technical-lead']
  const currentPath = request.nextUrl.pathname

  if (protectedPaths.some(path => currentPath.startsWith(path)) && !session) {
    const url = new URL('/', request.url)
    url.searchParams.set('from', currentPath)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
