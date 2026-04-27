'use client';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: any[];
}

import DataRoomChat from './DataRoomChat';

export default function DataRoom() {
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<{id: string, title: string}[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('org_id', 'default-org'); // Replace with actual orgId from session
      
      try {
        await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'}/ingest/upload`, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    setIsUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Sidebar - Chat History */}
      <div className="w-64 border-r border-zinc-800/60 bg-[#161618]/50 flex flex-col p-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Data Room Threads</h2>
        <div className="flex-1 space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20">
            Current Session
          </button>
          {history.map(item => (
            <button key={item.id} className="w-full text-left px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors">
              {item.title}
            </button>
          ))}
        </div>
        
        {/* Upload Zone */}
        <div {...getRootProps()} className={`mt-auto p-4 border-2 border-dashed rounded-xl transition-all ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'} flex flex-col items-center justify-center cursor-pointer`}>
          <input {...getInputProps()} />
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="text-[10px] font-bold uppercase text-zinc-500">{isUploading ? 'Uploading...' : 'Upload Docs'}</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <DataRoomChat orgId="default-org" />
    </div>
  );
}
