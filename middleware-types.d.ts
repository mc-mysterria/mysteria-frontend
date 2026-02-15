// Type declarations for Vercel Edge Middleware (non-Next.js projects)

declare module 'next/server' {
  export interface NextRequest {
    url: string;
    headers: Headers;
    method: string;
    body?: any;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string): void;
      delete(name: string): void;
    };
    geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    ip?: string;
    nextUrl: URL;
  }

  export class NextResponse extends Response {
    static next(init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static json(data: any, init?: ResponseInit): NextResponse;
    cookies: {
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
  }
}
