// app/components/OnboardingTour.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";

interface TourStep {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const TOURS: Record<string, TourStep[]> = {
  Policymaker: [
    {
      title: "Welcome to your Policy Intelligence Center",
      body: "This is your personal command center for country-level mental health reform evidence.",
    },
    {
      title: "Track reform progress in real time",
      body: "Your dashboard pulls live scores on legislation, implementation, and SDG alignment for every country on the continent.",
    },
    {
      title: "Compare against peer countries",
      body: "See how your country ranks against regional peers on 12 different reform dimensions.",
    },
    {
      title: "Generate a minister-ready Executive Brief",
      body: "One click produces a formal PDF with findings, recommendations, and a signature block — ready for cabinet.",
      ctaLabel: "Try it now",
      ctaHref: "/policymaker",
    },
    {
      title: "Stay informed",
      body: "Governance alerts appear at the top of every page. Adjust your notification preferences in Settings.",
    },
    {
      title: "You're ready",
      body: "Your dashboard is now live and updating. Welcome aboard.",
    },
  ],

  Researcher: [
    {
      title: "Welcome to the Research Network",
      body: "You now have access to Africa's largest mental health research repository and funding network.",
    },
    {
      title: "Browse the Knowledge Repository",
      body: "Over 500 peer-reviewed papers, datasets, and toolkits — searchable by country, SDG, and reform theme.",
      ctaLabel: "Open Repository",
      ctaHref: "/repository",
    },
    {
      title: "Submit a funding request",
      body: "Post your research needs. Donors browse verified requests weekly and can fund directly through the platform.",
      ctaLabel: "Submit a Request",
      ctaHref: "/funding-requests/new",
    },
    {
      title: "Join a working group",
      body: "Collaborate with peers on priority topics like decriminalization, workforce development, and youth mental health.",
      ctaLabel: "Browse Working Groups",
      ctaHref: "/working-groups",
    },
    {
      title: "You're ready",
      body: "Explore the repository, submit a request, or join a group — the choice is yours.",
    },
  ],

  CSO: [
    {
      title: "Welcome to the CSO Collaboration Portal",
      body: "This is where civil society organizations across Africa coordinate on mental health reform.",
    },
    {
      title: "Complete your organization profile",
      body: "A complete profile makes you visible to donors, partners, and government contacts.",
      ctaLabel: "Edit Profile",
      ctaHref: "/organizations",
    },
    {
      title: "Find and connect with partners",
      body: "The Collaboration Hub helps you find peer organizations by focus area, country, and shared reform goals.",
      ctaLabel: "Open Collaboration Hub",
      ctaHref: "/organizations/collaboration-hub",
    },
    {
      title: "Launch an advocacy campaign",
      body: "Mobilize supporters, track reach, and coordinate coalition actions — all in one workspace.",
      ctaLabel: "Start a Campaign",
      ctaHref: "/advocacy-campaigns/new",
    },
    {
      title: "Register for continental events",
      body: "Workshops, conferences, and peer exchanges are posted weekly. Register in one click.",
      ctaLabel: "Browse Events",
      ctaHref: "/events",
    },
    {
      title: "You're ready",
      body: "Your organization is now part of the continental collaboration network.",
    },
  ],

  Mental_Health_Professional: [
    {
      title: "Welcome to the Clinical Network",
      body: "You're joining [N] mental health professionals across Africa — the backbone of reform.",
    },
    {
      title: "Join a working group",
      body: "Working groups are where you collaborate with peers on clinical practice, supervision, and reform advocacy.",
      ctaLabel: "Browse Working Groups",
      ctaHref: "/working-groups",
    },
    {
      title: "Connect with peers",
      body: "The continental directory and events calendar help you stay connected to colleagues across borders.",
      ctaLabel: "Browse Events",
      ctaHref: "/events",
    },
    {
      title: "Contribute to research",
      body: "Share case learning, participate in studies, or help generate the evidence base for reform.",
      ctaLabel: "Open Research Hub",
      ctaHref: "/research-hub",
    },
    {
      title: "You're ready",
      body: "Welcome to the network. Your voice matters.",
    },
  ],

  Donor: [
    {
      title: "Welcome to Investment Intelligence",
      body: "This is your decision-support platform for strategic mental health funding.",
    },
    {
      title: "See where capital is most catalytic",
      body: "The Intelligence Hub ranks countries by funding gap, donor readiness, and ROI potential.",
      ctaLabel: "Open Intelligence Hub",
      ctaHref: "/donor-intelligence",
    },
    {
      title: "Review verified funding requests",
      body: "Every request is tied to a vetted researcher, organization, or program. Fund in one click.",
      ctaLabel: "Browse Requests",
      ctaHref: "/funding-requests",
    },
    {
      title: "Track your portfolio impact",
      body: "Your dashboard shows reach, beneficiaries, SDG alignment, and peer benchmarking in real time.",
      ctaLabel: "Open Dashboard",
      ctaHref: "/donor",
    },
    {
      title: "You're ready",
      body: "Welcome aboard. Your impact is now visible across the continent.",
    },
  ],
};

export default function OnboardingTour() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      setUser(u);

      const key = `onboarding_complete_${u.id}`;
      const done = localStorage.getItem(key);
      if (!done) {
        // Small delay so the page behind paints first
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  const tour: TourStep[] = user ? TOURS[user.role] || [] : [];

  const finish = () => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, "true");
    }
    setOpen(false);
  };

  const next = () => {
    if (step < tour.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!open || !user || tour.length === 0) return null;

  const current = tour[step];
  const isLast = step === tour.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-lg w-full rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-2xl overflow-hidden">
        {/* glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={finish}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Skip tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-xs font-mono tracking-widest">
              STEP {step + 1} OF {tour.length}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
            {current.title}
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {current.body}
          </p>

          {current.ctaHref && current.ctaLabel && (
            <button
              onClick={() => {
                finish();
                router.push(current.ctaHref!);
              }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
            >
              {current.ctaLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* progress dots */}
        <div className="relative px-8 pb-4 flex justify-center gap-1.5">
          {tour.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-cyan-400"
                  : i < step
                  ? "w-1.5 bg-cyan-400/60"
                  : "w-1.5 bg-slate-600"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* footer */}
        <div className="relative border-t border-slate-700/60 px-8 py-4 flex items-center justify-between bg-slate-900/60">
          <button
            onClick={prev}
            disabled={isFirst}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={finish}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip tour
          </button>

          <button
            onClick={next}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm transition-colors"
          >
            {isLast ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}