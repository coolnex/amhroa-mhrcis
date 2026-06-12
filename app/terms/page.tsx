// app/terms/page.tsx
"use client";

import Link from "next/link";
import { Heart, Shield, Globe, FileText, Users, Building2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20 py-12">
        <div className="relative px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
            <p className="text-slate-400 mt-4">Effective Date: June 12, 2024</p>
            <p className="text-slate-400">Last Updated: June 12, 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 space-y-8">
          
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">1.</span> Acceptance of Terms
            </h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using the African Mental Health Reform Organization Africa (AMHROA) platform 
              ("the Platform", "we", "us", "our"), you agree to be bound by these Terms and Conditions 
              ("Terms"). If you do not agree to these Terms, please do not use the Platform.
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              These Terms apply to all users of the Platform, including but not limited to: 
              policymakers, researchers, CSO representatives, country coordinators, donors, 
              mental health professionals, and public users.
            </p>
          </section>

          {/* 2. Definitions */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Definitions
            </h2>
            <div className="space-y-3 text-slate-300">
              <p><strong className="text-white">"Content"</strong> means any information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials.</p>
              <p><strong className="text-white">"User Content"</strong> means any Content that users upload, post, or transmit through the Platform.</p>
              <p><strong className="text-white">"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</p>
              <p><strong className="text-white">"Platform"</strong> means the AMHROA website, applications, APIs, and related services.</p>
            </div>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">3.</span> User Accounts
            </h2>
            <div className="space-y-3 text-slate-300">
              <p><strong className="text-white">3.1 Account Creation.</strong> To access certain features, you must create an account. You agree to provide accurate, current, and complete information.</p>
              <p><strong className="text-white">3.2 Account Approval.</strong> All accounts require administrative approval before access is granted. Approval may take up to 5-7 business days.</p>
              <p><strong className="text-white">3.3 Account Security.</strong> You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately of any unauthorized access.</p>
              <p><strong className="text-white">3.4 Account Suspension.</strong> We reserve the right to suspend or terminate accounts that violate these Terms or pose security risks.</p>
            </div>
          </section>

          {/* 4. User Roles and Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">4.</span> User Roles and Responsibilities
            </h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <p><strong className="text-cyan-400">Policymakers:</strong> You agree to use reform intelligence data for legitimate policy development purposes only.</p>
              </div>
              <div>
                <p><strong className="text-cyan-400">Researchers:</strong> You agree to uphold ethical research standards and properly attribute data sources.</p>
              </div>
              <div>
                <p><strong className="text-cyan-400">CSO Representatives:</strong> You agree to represent your organization accurately and submit truthful reports.</p>
              </div>
              <div>
                <p><strong className="text-cyan-400">Country Coordinators:</strong> You agree to submit timely, accurate national reports and maintain data integrity.</p>
              </div>
              <div>
                <p><strong className="text-cyan-400">Donors:</strong> You agree to use investment intelligence for legitimate funding decisions only.</p>
              </div>
              <div>
                <p><strong className="text-cyan-400">Mental Health Professionals:</strong> You agree to maintain professional standards and confidentiality.</p>
              </div>
            </div>
          </section>

          {/* 5. Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">5.</span> Prohibited Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Unauthorized data scraping or harvesting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Posting false or misleading information</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Attempting to bypass security measures</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Impersonating another user or entity</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Uploading malicious code or content</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Violating any applicable laws or regulations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Harassing, threatening, or harming others</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Sharing confidential or sensitive information</span>
              </div>
            </div>
          </section>

          {/* 6. Content and Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">6.</span> Content and Intellectual Property
            </h2>
            <div className="space-y-3 text-slate-300">
              <p><strong className="text-white">6.1 Ownership.</strong> The Platform and its original content, features, and functionality are owned by AMHROA and are protected by international copyright, trademark, and other intellectual property laws.</p>
              <p><strong className="text-white">6.2 User Content License.</strong> By submitting content, you grant AMHROA a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for continental reform purposes.</p>
              <p><strong className="text-white">6.3 Data Usage.</strong> Aggregated, anonymized data may be used for research, policy analysis, and reform tracking.</p>
            </div>
          </section>

          {/* 7. Data Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">7.</span> Data Privacy
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>, 
              which explains how we collect, use, and protect your personal information. By using the Platform, 
              you consent to the collection and use of your information as described in the Privacy Policy.
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">8.</span> Limitation of Liability
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>To the maximum extent permitted by law, AMHROA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>Your use or inability to use the Platform</li>
                <li>Any conduct or content of any third party on the Platform</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>
          </section>

          {/* 9. Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">9.</span> Disclaimer of Warranties
            </h2>
            <p className="text-slate-300 leading-relaxed">
              THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. AMHROA MAKES NO REPRESENTATIONS 
              OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, REGARDING THE OPERATION OR AVAILABILITY OF THE 
              PLATFORM, OR THE INFORMATION, CONTENT, AND MATERIALS INCLUDED THEREON.
            </p>
          </section>

          {/* 10. Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">10.</span> Indemnification
            </h2>
            <p className="text-slate-300 leading-relaxed">
              You agree to defend, indemnify, and hold harmless AMHROA, its affiliates, officers, directors, employees, 
              and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, 
              and expenses arising from your use of the Platform or violation of these Terms.
            </p>
          </section>

          {/* 11. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">11.</span> Termination
            </h2>
            <p className="text-slate-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, 
              your right to use the Platform will cease immediately.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">12.</span> Governing Law
            </h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to 
              its conflict of law provisions. Any legal proceedings arising out of or relating to these Terms 
              shall be brought exclusively in the courts of Nairobi, Kenya.
            </p>
          </section>

          {/* 13. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">13.</span> Changes to Terms
            </h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days' notice prior to any new terms taking effect. By continuing 
              to access or use our Platform after those revisions become effective, you agree to be bound by 
              the revised terms.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">14.</span> Contact Information
            </h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-white">AMHROA Legal Department</p>
              <p className="text-slate-300">Email: <a href="mailto:legal@amhroa.org" className="text-cyan-400 hover:underline">legal@amhroa.org</a></p>
              <p className="text-slate-300">Phone: +254 712 345 678</p>
              <p className="text-slate-300">Address: Nairobi, Kenya</p>
            </div>
          </section>

          {/* Last Section - Acknowledgement */}
          <div className="pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-sm">
              By using AMHROA, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              © 2024 AMHROA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}