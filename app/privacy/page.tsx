// app/privacy/page.tsx
"use client";

import Link from "next/link";
import { Heart, Shield, Lock, Database, Eye, UserCheck, FileText, Globe } from "lucide-react";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-slate-400 mt-4">Effective Date: June 12, 2024</p>
            <p className="text-slate-400">Last Updated: June 12, 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-cyan-400" />
              Introduction
            </h2>
            <p className="text-slate-300 leading-relaxed">
              The African Mental Health Reform Organization Africa (AMHROA) ("we", "us", "our") is committed to 
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our platform, website, and related services.
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              We respect your privacy rights and are committed to transparency about our data practices. 
              This policy applies to all users, including policymakers, researchers, CSO representatives, 
              country coordinators, donors, mental health professionals, and public users.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-cyan-400" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">Personal Information You Provide</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• <strong>Account Information:</strong> Name, email address, phone number, organization, role, country</li>
                  <li>• <strong>Profile Information:</strong> Professional credentials, areas of expertise, biography</li>
                  <li>• <strong>Submission Content:</strong> Reports, research papers, field reports, survey responses</li>
                  <li>• <strong>Communication:</strong> Messages, feedback, support requests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">Information Automatically Collected</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• <strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                  <li>• <strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li>• <strong>Location Data:</strong> Approximate geographic location based on IP address</li>
                  <li>• <strong>Cookies:</strong> Small data files stored on your device to enhance functionality</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">Sensitive Information</h3>
                <p className="text-slate-300">
                  Given the nature of our work, we may collect sensitive information related to mental health 
                  assessments, field reports, and human rights observations. We treat all such information with 
                  the highest level of confidentiality and security.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-cyan-400" />
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Platform Operations</h3>
                <p className="text-slate-300 text-sm">Create and manage accounts, authenticate users, provide personalized dashboards</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Reform Intelligence</h3>
                <p className="text-slate-300 text-sm">Generate reform scores, policy recommendations, and continental analytics</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Research & Analysis</h3>
                <p className="text-slate-300 text-sm">Conduct continental research, identify trends, measure reform progress</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Communication</h3>
                <p className="text-slate-300 text-sm">Send notifications, updates, and respond to inquiries</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Security & Compliance</h3>
                <p className="text-slate-300 text-sm">Detect fraud, enforce policies, comply with legal obligations</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-400 mb-2">Platform Improvement</h3>
                <p className="text-slate-300 text-sm">Enhance user experience, develop new features, optimize performance</p>
              </div>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              Legal Basis for Processing
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>We process your personal information under the following legal bases:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Contract Performance:</strong> To provide services you have requested</li>
                <li><strong>Legitimate Interests:</strong> For continental reform monitoring, research, and platform security</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing</li>
                <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
                <li><strong>Service Providers:</strong> With vendors who perform services on our behalf</li>
                <li><strong>Continental Partners:</strong> With AU, WHO, and other legitimate continental bodies</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Aggregated Data:</strong> Anonymized data for research and policy analysis</li>
              </ul>
              <p className="mt-3 text-cyan-400 text-sm">
                We NEVER sell your personal information to third parties.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-cyan-400" />
              Data Security
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access to sensitive information</li>
                <li><strong>Authentication:</strong> Secure authentication and session management</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and threat detection</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and penetration testing</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, 
                we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. 
              We may also retain information as necessary to comply with legal obligations, resolve disputes, and enforce agreements.
            </p>
            <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-slate-300 text-sm">
                <strong className="text-white">Retention Periods:</strong>
              </p>
              <ul className="text-slate-400 text-sm mt-1 space-y-1">
                <li>• Account Information: Duration of account + 30 days</li>
                <li>• Reports & Submissions: Indefinitely for continental record-keeping</li>
                <li>• Survey Responses: 5 years for research purposes</li>
                <li>• Activity Logs: 12 months</li>
              </ul>
            </div>
          </section>

          {/* Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-cyan-400" />
              Your Privacy Rights
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent</li>
              </ul>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-slate-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and improve our platform. 
              You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">Essential Cookies</span>
              <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">Analytics Cookies</span>
              <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">Preference Cookies</span>
            </div>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
            <p className="text-slate-300 leading-relaxed">
              As a continental platform, your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information, including Standard Contractual Clauses 
              and data processing agreements.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our platform is not intended for children under 16 years of age. We do not knowingly collect personal information 
              from children under 16. If we learn we have collected information from a child under 16, we will delete that information.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Links</h2>
            <p className="text-slate-300 leading-relaxed">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices or 
              content of these third-party sites. We encourage you to read their privacy policies before providing any information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 text-slate-300">
              <li>Posting the new policy on this page</li>
              <li>Sending an email notification to registered users</li>
              <li>Displaying a prominent notice on the platform</li>
            </ul>
            <p className="text-slate-300 mt-2">
              The "Last Updated" date at the top of this policy indicates when changes were made.
            </p>
          </section>

          {/* Data Protection Officer */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Protection Officer</h2>
            <div className="p-4 bg-slate-700/30 rounded-xl">
              <p className="text-white">Data Protection Officer</p>
              <p className="text-slate-300">AMHROA</p>
              <p className="text-slate-300">Email: <a href="mailto:dpo@amhroa.org" className="text-cyan-400 hover:underline">dpo@amhroa.org</a></p>
              <p className="text-slate-300">Phone: +254 712 345 678</p>
            </div>
          </section>

          {/* Complaints */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Complaints</h2>
            <p className="text-slate-300 leading-relaxed">
              If you believe we have violated your privacy rights, you have the right to lodge a complaint with:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 text-slate-300">
              <li>Our Data Protection Officer at <a href="mailto:dpo@amhroa.org" className="text-cyan-400">dpo@amhroa.org</a></li>
              <li>Your local data protection authority</li>
            </ul>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-white">AMHROA Privacy Team</p>
              <p className="text-slate-300">Email: <a href="mailto:privacy@amhroa.org" className="text-cyan-400 hover:underline">privacy@amhroa.org</a></p>
              <p className="text-slate-300">Phone: +254 712 345 678</p>
              <p className="text-slate-300">Address: Nairobi, Kenya</p>
            </div>
          </section>

          {/* Acknowledgement */}
          <div className="pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-sm">
              By using AMHROA, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy.
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