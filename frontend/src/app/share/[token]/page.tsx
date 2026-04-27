import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DataRoomChat from "@/components/DataRoomChat";

export default async function SharePage({ params }: { params: { token: string } }) {
  const { token } = await params;
  
  const sharedLink = await prisma.sharedLink.findUnique({
    where: { token: token },
    include: { org: true }
  });

  if (!sharedLink || sharedLink.expiresAt < new Date()) {
    notFound();
  }

  return (
    <main className="h-screen bg-[#0f0f11] flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-6 bg-[#161618]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">{sharedLink.org.name}</h1>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Institutional Data Room</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Read-Only Access</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">
                Expires: {sharedLink.expiresAt.toLocaleDateString()}
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent)] opacity-20 pointer-events-none"></div>
        <DataRoomChat token={token} readOnly={true} />
      </div>
      
      <footer className="h-8 border-t border-zinc-800/40 bg-[#0f0f11] flex items-center justify-center">
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Secured by MemoryOS Cryptographic Data Room</p>
      </footer>
    </main>
  );
}
