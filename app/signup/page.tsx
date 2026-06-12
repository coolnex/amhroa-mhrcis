"use client";

import Link from "next/link";
import Image from "next/image";
import {
  User,
  Building2,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function SignupChoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">

        {/* Logo */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="AMHROA"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Join AMHROA
          </h1>

          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            Choose how you would like to register on the African Mental Health Reform Observatory & Analytics platform.
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Individual */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:border-cyan-500 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-cyan-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Individual Account
            </h2>

            <p className="text-slate-400 mb-6">
              Register as an individual professional, researcher,
              policymaker, coordinator, donor, civil society representative,
              or mental health practitioner.
            </p>

            <div className="space-y-3 mb-8 text-sm">
              <div className="text-slate-300">
                ✓ Research Repository Access
              </div>

              <div className="text-slate-300">
                ✓ AI Policy Intelligence
              </div>

              <div className="text-slate-300">
                ✓ Country Dashboards
              </div>

              <div className="text-slate-300">
                ✓ Data Submission Access
              </div>
            </div>

            <Link
              href="/signup/user"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
            >
              Register as Individual
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Organization */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:border-emerald-500 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Organization Account
            </h2>

            <p className="text-slate-400 mb-6">
              Register your NGO, university, government agency,
              hospital, research institute, or development organization.
            </p>

            <div className="space-y-3 mb-8 text-sm">
              <div className="text-slate-300">
                ✓ Organizational Dashboard
              </div>

              <div className="text-slate-300">
                ✓ Team Management
              </div>

              <div className="text-slate-300">
                ✓ Institutional Reporting
              </div>

              <div className="text-slate-300">
                ✓ Partnership Opportunities
              </div>
            </div>

            <Link
              href="/signup/organizations"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Register Organization
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Approval Notice */}
        <div className="mt-10 bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 mt-1" />

            <div>
              <h3 className="text-white font-semibold">
                Approval Required
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                All registrations are reviewed by the AMHROA administration team
                before access is granted. This helps maintain the integrity,
                quality, and security of the continental mental health
                intelligence network.
              </p>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}