import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { query, token } = body;
  
  let orgId: string | null = null;

  if (token) {
    // Validate shared link token
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token: token },
      include: { org: true }
    });

    if (sharedLink && sharedLink.expiresAt > new Date()) {
      orgId = sharedLink.orgId;
    }
  }

  if (!orgId) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (session && session.session.activeOrganizationId) {
      orgId = session.session.activeOrganizationId;
    }
  }
  
  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      ...body, 
      org_id: orgId 
    })
  });
  
  return new NextResponse(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
