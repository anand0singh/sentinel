"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center justify-center p-6 font-mono">
      <div className="bg-[#0a0c10] border-2 border-acid-lime p-8 max-w-md w-full text-center shadow-acid-md bracket-corner">
        <div className="text-acid-lime text-xs font-bold uppercase tracking-widest mb-2">
          &gt; ERROR_404 // SIGNAL_LOST
        </div>
        <h1 className="text-6xl font-display font-black text-white my-2">404</h1>
        <p className="text-xs text-muted-gray mb-6 leading-relaxed">
          The requested coordinate or sector does not exist in the Sentinel Defense Matrix.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-acid-lime text-black px-6 py-2.5 font-display font-black text-xs uppercase tracking-wider shadow-acid-sm hover:bg-white transition"
        >
          <ArrowLeft size={14} className="mr-1" /> RETURN TO SECTOR 01
        </Link>
      </div>
    </div>
  );
}
