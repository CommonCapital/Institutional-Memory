import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session || !session.session.activeOrganizationId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { expiresDays = 7, permissions = {} } = await request.json();
  const orgId = session.session.activeOrganizationId;
  
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresDays);

  const sharedLink = await prisma.sharedLink.create({
    data: {
      orgId: orgId,
      token: token,
      expiresAt: expiresAt,
      permissions: permissions
    }
  });

  return NextResponse.json({
    url: `${process.env.BETTER_AUTH_URL}/share/${token}`,
    expiresAt: expiresAt
  });
}
