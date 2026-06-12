"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white flex items-center justify-center px-6">

      <div className="max-w-5xl text-center">

        <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm mb-8">
          AMHROA MHRCIS v3.0
        </div>

        <h1 className="text-6xl font-black leading-tight">
          Africa Mental Health
          <span className="block text-cyan-400">
            Reform Intelligence System
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-300 leading-relaxed">
          Pan-African Governance,
          Reform Analytics,
          SDG Intelligence,
          AI Policy Insights,
          Continental Monitoring,
          and Executive Decision Infrastructure.
        </p>

        <div className="mt-12 flex flex-wrap gap-4 justify-center">

          <Link
            href="/login"
            className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl"
          >
            Enter Platform
          </Link>

          <Link
            href="/public"
            className="border border-slate-600 hover:border-cyan-400 hover:text-cyan-300 transition px-8 py-4 rounded-2xl text-lg"
          >
            Quick Preview
          </Link>

        </div>

      </div>

    </main>
  );
}