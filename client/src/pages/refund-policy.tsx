import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
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
            <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Refund Policy
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Clear guidelines on refunds, returns, and dispute resolution for digital products
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
            <Button variant="outline" className="border-slate-600 hover:border-green-500 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Quick Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">14-Day Window</h3>
              <p className="text-green-200">Request refunds within 14 days of purchase for eligible items</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fast Processing</h3>
              <p className="text-orange-200">Most refund requests processed within 3-5 business days</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Full Refunds</h3>
              <p className="text-blue-200">100% refund for eligible cases, no hidden fees or deductions</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Refund Policy Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-invert max-w-none space-y-8">
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <RefreshCw className="h-6 w-6 mr-2 text-green-400" />
                    1. Refund Eligibility
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Eligible for Refund
                      </h3>
                      <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li><strong>Technical Issues:</strong> Mod files are corrupted, incomplete, or fail to download properly</li>
                        <li><strong>Product Defects:</strong> Significant bugs or issues not disclosed at time of purchase</li>
                        <li><strong>Duplicate Purchases:</strong> Accidental multiple purchases of the same item</li>
                        <li><strong>Unauthorized Transactions:</strong> Purchases made without account holder's consent</li>
                        <li><strong>Compatibility Issues:</strong> Mod doesn't work with supported game versions (if properly documented)</li>
                        <li><strong>Billing Errors:</strong> Incorrect charges or pricing discrepancies</li>
                      </ul>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        Not Eligible for Refund
                      </h3>
                      <ul className="list-disc list-inside text-slate-300 space-y-2">
                        <li><strong>Change of Mind:</strong> Simply not liking the mod after successful download</li>
                        <li><strong>User Error:</strong> Incorrect installation or configuration by user</li>
                        <li><strong>System Requirements:</strong> Mod not working due to insufficient system specifications</li>
                        <li><strong>Game Updates:</strong> Mod incompatibility due to game updates after purchase</li>
                        <li><strong>Subscription Services:</strong> Partial refunds for subscription periods already used</li>
                        <li><strong>Sale Items:</strong> Products purchased during final clearance sales (clearly marked)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Refund Process</h2>
                  <div className="space-y-6 text-slate-300">
                    <h3 className="text-xl font-semibold text-white">Step-by-Step Guide</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                          <h4 className="font-semibold text-white">Contact Support</h4>
                          <p>Email support@jsdmods.com within 14 days of purchase with your order details and reason for refund.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                          <h4 className="font-semibold text-white">Provide Information</h4>
                          <p>Include order number, purchase date, specific issue details, and any error messages or screenshots.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                          <h4 className="font-semibold text-white">Review Process</h4>
                          <p>Our team will review your request within 24-48 hours and may request additional information.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                        <div>
                          <h4 className="font-semibold text-white">Resolution</h4>
                          <p>If approved, refund will be processed to your original payment method within 3-5 business days.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mt-6">
                      <h4 className="font-semibold text-blue-300 mb-2">Required Information for Refund Requests:</h4>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        <li>Order confirmation number</li>
                        <li>Email address used for purchase</li>
                        <li>Date of purchase</li>
                        <li>Detailed description of the issue</li>
                        <li>Screenshots or error messages (if applicable)</li>
                        <li>System specifications (for compatibility issues)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. Digital Product Policy</h2>
                  <div className="space-y-4 text-slate-300">
                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-orange-300 mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Important Notice for Digital Products
                      </h3>
                      <p className="mb-4">
                        Due to the instant and digital nature of our products, <strong>all sales are considered final once the download link has been accessed or the product has been downloaded</strong>.
                      </p>
                      <p>
                        However, we understand that technical issues can occur, and we're committed to providing excellent customer service. We will consider refund requests on a case-by-case basis for legitimate issues as outlined in our eligibility criteria.
                      </p>
                    </div>

                    <h3 className="text-xl font-semibold text-white">Download Protection</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>First-time download issues are covered under our refund policy</li>
                      <li>Re-download links are provided free of charge for 30 days after purchase</li>
                      <li>Backup download links available in your Mod Locker indefinitely</li>
                      <li>Technical support provided for installation and setup issues</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Refunds</h2>
                  <div className="space-y-4 text-slate-300">
                    <h3 className="text-xl font-semibold text-white">Premium Subscription Policy</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Cancel Anytime:</strong> No questions asked cancellation before next billing cycle</li>
                      <li><strong>Prorated Refunds:</strong> Refunds for unused subscription time in exceptional cases</li>
                      <li><strong>First Month Guarantee:</strong> Full refund available within first 30 days of initial subscription</li>
                      <li><strong>Service Issues:</strong> Refunds provided if service is unavailable for extended periods</li>
                    </ul>

                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mt-6">
                      <h4 className="font-semibold text-purple-300 mb-2">Subscription Refund Process:</h4>
                      <ol className="list-decimal list-inside text-slate-300 space-y-2">
                        <li>Contact support with your subscription details</li>
                        <li>Specify the reason for cancellation and refund request</li>
                        <li>Cancel recurring billing to prevent future charges</li>
                        <li>Receive prorated refund based on unused time (if eligible)</li>
                      </ol>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Processing Times and Methods</h2>
                  <div className="space-y-4 text-slate-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/30 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Processing Timeline</h3>
                        <ul className="space-y-2">
                          <li><strong>Review:</strong> 24-48 hours</li>
                          <li><strong>Approval:</strong> 1-2 business days</li>
                          <li><strong>Processing:</strong> 3-5 business days</li>
                          <li><strong>Bank Processing:</strong> 2-7 business days</li>
                        </ul>
                      </div>

                      <div className="bg-slate-700/30 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Refund Methods</h3>
                        <ul className="space-y-2">
                          <li><strong>Credit Card:</strong> Original payment method</li>
                          <li><strong>PayPal:</strong> PayPal account</li>
                          <li><strong>Bank Transfer:</strong> For large amounts (upon request)</li>
                          <li><strong>Store Credit:</strong> Optional alternative for faster processing</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                      <p className="text-yellow-200">
                        <strong>Note:</strong> Refund processing times may vary depending on your bank or payment provider. 
                        International transactions may take additional time due to currency conversion and international banking procedures.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Dispute Resolution</h2>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      If you're not satisfied with our refund decision, we offer multiple levels of dispute resolution:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white">Level 1: Manager Review</h4>
                        <p>Request escalation to a senior support manager for case review</p>
                      </div>

                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white">Level 2: Administrative Review</h4>
                        <p>Administrative team review for complex cases or policy exceptions</p>
                      </div>

                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white">Level 3: Payment Provider Dispute</h4>
                        <p>Dispute through your credit card company or PayPal if our process doesn't resolve the issue</p>
                      </div>
                    </div>

                    <p className="mt-4">
                      We're committed to fair resolution and will work with you to find a solution that satisfies both parties.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. Contact Information</h2>
                  <div className="bg-slate-700/50 p-6 rounded-lg space-y-4">
                    <p className="text-white font-semibold">Refund Support Team</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          <strong>Email:</strong> refunds@jsdmods.com
                        </p>
                        <p className="text-slate-300">
                          <strong>General Support:</strong> support@jsdmods.com
                        </p>
                        <p className="text-slate-300">
                          <strong>Priority Support:</strong> Available for premium subscribers
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          <strong>Response Time:</strong> Within 24 hours
                        </p>
                        <p className="text-slate-300">
                          <strong>Operating Hours:</strong> 9 AM - 6 PM EST, Mon-Fri
                        </p>
                        <p className="text-slate-300">
                          <strong>Emergency:</strong> Critical issues handled on weekends
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-12 p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-center text-slate-300">
                    We value your satisfaction and trust. Our refund policy is designed to be fair to both customers and creators. 
                    If you have any questions about this policy, please don't hesitate to contact our support team.
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
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/terms">
              <Button variant="outline" className="border-slate-600 hover:border-purple-500 text-white">
                Terms of Service
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="border-slate-600 hover:border-blue-500 text-white">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-600 hover:border-green-500 text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}