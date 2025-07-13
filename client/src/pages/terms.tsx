import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Please read these terms carefully before using JSD Mods services
          </p>
          <p className="text-sm text-slate-400 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="outline" className="border-slate-600 hover:border-purple-500 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-invert max-w-none space-y-8">
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-purple-400" />
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-slate-300 leading-relaxed">
                    By accessing and using JSD Mods ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    JSD Mods provides premium modifications for BeamNG.drive. Our services include:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Digital download of premium vehicle modifications</li>
                    <li>Access to mod locker for purchased content</li>
                    <li>Community support and forums</li>
                    <li>Regular updates and improvements to purchased mods</li>
                    <li>Premium subscription services</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    To access certain features of our service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. Purchases and Payments</h2>
                  <div className="space-y-4 text-slate-300">
                    <p><strong>Payment Processing:</strong> All payments are processed securely through Stripe. We do not store your payment information.</p>
                    <p><strong>Pricing:</strong> All prices are in USD unless otherwise specified. Prices may change without notice.</p>
                    <p><strong>Digital Content:</strong> Upon successful payment, you will receive immediate access to download your purchased mods.</p>
                    <p><strong>Subscription Services:</strong> Recurring subscriptions will automatically renew unless cancelled before the renewal date.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Refund Policy</h2>
                  <div className="space-y-4 text-slate-300">
                    <p><strong>Digital Products:</strong> Due to the digital nature of our products, all sales are final once the download link has been accessed.</p>
                    <p><strong>Exceptional Cases:</strong> Refunds may be considered in cases of:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Technical issues preventing download or installation</li>
                      <li>Significant product defects not disclosed at time of purchase</li>
                      <li>Duplicate purchases made in error</li>
                    </ul>
                    <p><strong>Refund Process:</strong> Contact our support team within 14 days of purchase with your order details and reason for refund request.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>All content provided through JSD Mods, including but not limited to vehicle modifications, textures, models, and documentation, is protected by copyright and other intellectual property laws.</p>
                    <p><strong>License Grant:</strong> Upon purchase, you receive a non-exclusive, non-transferable license to use the mod(s) for personal gaming purposes only.</p>
                    <p><strong>Restrictions:</strong> You may not:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Redistribute, resell, or share purchased mods</li>
                      <li>Reverse engineer or decompile mod files</li>
                      <li>Use mods for commercial purposes</li>
                      <li>Remove or modify copyright notices</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. User Conduct</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">You agree not to:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Use the service for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Upload malicious software or content</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Impersonate other individuals or entities</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Privacy and Data Protection</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Your privacy is important to us. Please review our <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link> to understand how we collect, use, and protect your information. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers and Limitations</h2>
                  <div className="space-y-4 text-slate-300">
                    <p><strong>AS IS BASIS:</strong> Our service is provided "as is" without warranties of any kind, express or implied.</p>
                    <p><strong>COMPATIBILITY:</strong> While we strive for compatibility, we cannot guarantee that mods will work with all system configurations or game versions.</p>
                    <p><strong>LIMITATION OF LIABILITY:</strong> JSD Mods shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
                  <p className="text-slate-300 leading-relaxed">
                    These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
                  <div className="bg-slate-700/50 p-6 rounded-lg space-y-2">
                    <p className="text-white font-semibold">JSD Mods Support</p>
                    <p className="text-slate-300">Email: support@jsdmods.com</p>
                    <p className="text-slate-300">Discord: <a href="#" className="text-purple-400 hover:text-purple-300">Join our server</a></p>
                    <p className="text-slate-300">Response time: Within 24-48 hours</p>
                  </div>
                </section>

                <div className="mt-12 p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-center text-slate-300">
                    By using JSD Mods, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy">
              <Button variant="outline" className="border-slate-600 hover:border-blue-500 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </Link>
            <Link href="/refund-policy">
              <Button variant="outline" className="border-slate-600 hover:border-green-500 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Refund Policy
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-600 hover:border-purple-500 text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}