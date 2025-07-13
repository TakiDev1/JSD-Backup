import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your data.
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
            <Button variant="outline" className="border-slate-600 hover:border-blue-500 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Privacy Content */}
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
                    <Eye className="h-6 w-6 mr-2 text-blue-400" />
                    1. Information We Collect
                  </h2>
                  <div className="space-y-4 text-slate-300">
                    <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                    <p>We collect information you provide directly to us, including:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Name and email address when creating an account</li>
                      <li>Username and profile information</li>
                      <li>Payment information (processed securely through Stripe)</li>
                      <li>Communications with our support team</li>
                      <li>Discord information if you connect your Discord account</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6">Automatically Collected Information</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>IP address and general location information</li>
                      <li>Browser type, operating system, and device information</li>
                      <li>Usage patterns and website interactions</li>
                      <li>Download history and mod usage statistics</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Database className="h-6 w-6 mr-2 text-green-400" />
                    2. How We Use Your Information
                  </h2>
                  <div className="space-y-4 text-slate-300">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process payments and manage your account</li>
                      <li>Send you updates about your purchases and account</li>
                      <li>Provide customer support and respond to inquiries</li>
                      <li>Send promotional communications (with your consent)</li>
                      <li>Analyze usage patterns to improve user experience</li>
                      <li>Prevent fraud and ensure security</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing and Disclosure</h2>
                  <div className="space-y-4 text-slate-300">
                    <p><strong>We do not sell, trade, or rent your personal information to third parties.</strong></p>
                    
                    <h3 className="text-xl font-semibold text-white">We may share information in the following circumstances:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Service Providers:</strong> With trusted third-party services (Stripe for payments, hosting providers)</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of assets</li>
                      <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6">Third-Party Services</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Stripe:</strong> Payment processing (subject to Stripe's privacy policy)</li>
                      <li><strong>Discord:</strong> Authentication and community features (if connected)</li>
                      <li><strong>Analytics:</strong> Website usage analytics (anonymized data)</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Lock className="h-6 w-6 mr-2 text-yellow-400" />
                    4. Data Security
                  </h2>
                  <div className="space-y-4 text-slate-300">
                    <p>We implement appropriate security measures to protect your personal information:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>Secure password hashing and storage</li>
                      <li>Regular security audits and updates</li>
                      <li>Limited access to personal data on a need-to-know basis</li>
                      <li>Secure hosting infrastructure with backup systems</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Important:</strong> No method of transmission over the internet is 100% secure. 
                      While we strive to protect your personal information, we cannot guarantee absolute security.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking Technologies</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>We use cookies and similar technologies to:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Remember your login status and preferences</li>
                      <li>Analyze website traffic and usage patterns</li>
                      <li>Provide personalized content and features</li>
                      <li>Improve website performance and functionality</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-white mt-6">Cookie Types</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    </ul>
                    
                    <p className="mt-4">
                      You can control cookies through your browser settings, but disabling certain cookies may affect website functionality.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>We retain your personal information for as long as necessary to:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Provide our services to you</li>
                      <li>Comply with legal obligations</li>
                      <li>Resolve disputes and enforce agreements</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-white mt-6">Specific Retention Periods</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Account Information:</strong> Until account deletion or 3 years of inactivity</li>
                      <li><strong>Purchase Records:</strong> 7 years for tax and legal compliance</li>
                      <li><strong>Support Communications:</strong> 3 years after resolution</li>
                      <li><strong>Analytics Data:</strong> 2 years (anonymized after 6 months)</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights and Choices</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>You have the following rights regarding your personal information:</p>
                    
                    <h3 className="text-xl font-semibold text-white">Access and Control</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Access:</strong> Request a copy of your personal data</li>
                      <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                      <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6">Communication Preferences</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Unsubscribe from marketing emails</li>
                      <li>Manage notification preferences in your account</li>
                      <li>Control cookie preferences through browser settings</li>
                    </ul>

                    <p className="mt-4">
                      To exercise these rights, contact us at privacy@jsdmods.com or through your account settings.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      Our services are not intended for children under 13 years of age. We do not knowingly collect 
                      personal information from children under 13. If you are a parent or guardian and believe your 
                      child has provided us with personal information, please contact us immediately.
                    </p>
                    <p>
                      If we discover that we have collected personal information from a child under 13, we will 
                      delete such information from our systems promptly.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Globe className="h-6 w-6 mr-2 text-purple-400" />
                    9. International Data Transfers
                  </h2>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      Your information may be transferred to and processed in countries other than your own. 
                      These countries may have different data protection laws than your jurisdiction.
                    </p>
                    <p>
                      When we transfer your data internationally, we ensure appropriate safeguards are in place 
                      to protect your information in accordance with applicable privacy laws.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      We may update this Privacy Policy from time to time to reflect changes in our practices 
                      or for other operational, legal, or regulatory reasons.
                    </p>
                    <p>
                      We will notify you of any material changes by posting the new Privacy Policy on this page 
                      and updating the "Last updated" date. For significant changes, we may also send you an 
                      email notification.
                    </p>
                    <p>
                      Your continued use of our services after the changes take effect constitutes acceptance 
                      of the updated Privacy Policy.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
                  <div className="bg-slate-700/50 p-6 rounded-lg space-y-4">
                    <p className="text-white font-semibold">Privacy Questions or Concerns?</p>
                    <div className="space-y-2">
                      <p className="text-slate-300">
                        <strong>Email:</strong> privacy@jsdmods.com
                      </p>
                      <p className="text-slate-300">
                        <strong>General Support:</strong> support@jsdmods.com
                      </p>
                      <p className="text-slate-300">
                        <strong>Response Time:</strong> Within 48 hours for privacy-related inquiries
                      </p>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                      <p className="text-blue-200 text-sm">
                        <strong>Data Protection Officer:</strong> For residents of the EU/UK, you may also contact 
                        our Data Protection Officer at dpo@jsdmods.com for privacy-related matters.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-center text-slate-300">
                    This Privacy Policy is effective as of the date listed above and applies to all information 
                    collected by JSD Mods through our website and services.
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
            <Link href="/terms">
              <Button variant="outline" className="border-slate-600 hover:border-purple-500 text-white">
                Terms of Service
              </Button>
            </Link>
            <Link href="/refund-policy">
              <Button variant="outline" className="border-slate-600 hover:border-green-500 text-white">
                Refund Policy
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-600 hover:border-blue-500 text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}