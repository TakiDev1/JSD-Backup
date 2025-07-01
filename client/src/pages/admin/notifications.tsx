import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/admin-layout";
import { 
  Mail, 
  Send, 
  Users, 
  MessageSquare, 
  Bell, 
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export default function AdminNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMod, setSelectedMod] = useState("");
  const [notificationType, setNotificationType] = useState("mod_update");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Get mods for notification selection
  const { data: modsData, isLoading: modsLoading } = useQuery({
    queryKey: ['/api/mods'],
  });

  const mods = (modsData as any)?.mods || [];

  // Get recent notifications activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
  });

  const notificationActivity = ((activityData as any) || []).filter((activity: any) => 
    activity.action.includes('NOTIFICATION') || activity.action.includes('EMAIL')
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/notifications/send", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity'] });
      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully",
      });
      // Reset form
      setSelectedMod("");
      setSubject("");
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Send Failed",
        description: "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const handleSendNotification = () => {
    if (!subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      type: notificationType,
      modId: selectedMod || null,
      subject,
      message,
    };

    sendNotificationMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Notifications Center</h1>
              <p className="text-slate-400">Send notifications and manage communication with your users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send New Notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-400" />
                    Send Notification
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Send notifications to your users about updates, announcements, and more
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-type" className="text-white">Notification Type</Label>
                    <Select value={notificationType} onValueChange={setNotificationType}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="mod_update">Mod Update</SelectItem>
                        <SelectItem value="announcement">Site Announcement</SelectItem>
                        <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                        <SelectItem value="promotion">Promotion/Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {notificationType === "mod_update" && (
                    <div className="space-y-2">
                      <Label htmlFor="mod-select" className="text-white">Select Mod</Label>
                      <Select value={selectedMod} onValueChange={setSelectedMod}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Choose a mod" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {mods.map((mod: any) => (
                            <SelectItem key={mod.id} value={mod.id.toString()}>
                              {mod.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter notification subject"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your notification message..."
                      rows={4}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <Button
                    onClick={handleSendNotification}
                    disabled={sendNotificationMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white"
                  >
                    {sendNotificationMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400" />
                    Notification Stats
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Recent notification activity and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {notificationActivity.length}
                      </div>
                      <div className="text-sm text-slate-400">Total Sent</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {notificationActivity.filter((a: any) => 
                          a.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length}
                      </div>
                      <div className="text-sm text-slate-400">This Week</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Recent Activity</h4>
                    {notificationActivity.length > 0 ? (
                      notificationActivity.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{activity.action}</p>
                            <p className="text-xs text-slate-400">{activity.details}</p>
                          </div>
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400">No recent notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Notification Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Quick Templates
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Pre-made notification templates for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Mod Update",
                      description: "Notify users about new mod versions",
                      icon: UserPlus,
                      template: {
                        subject: "New Mod Update Available!",
                        message: "A new version of [MOD_NAME] is now available with exciting new features and improvements."
                      }
                    },
                    {
                      title: "Site Maintenance",
                      description: "Inform users about scheduled maintenance",
                      icon: AlertCircle,
                      template: {
                        subject: "Scheduled Maintenance Notice",
                        message: "We will be performing scheduled maintenance on [DATE] from [TIME] to [TIME]. The site may be temporarily unavailable during this period."
                      }
                    },
                    {
                      title: "Special Promotion",
                      description: "Announce sales and special offers",
                      icon: CheckCircle,
                      template: {
                        subject: "Special Promotion - Limited Time Only!",
                        message: "Don't miss out on our special promotion! Get [DISCOUNT]% off on all premium mods. Offer valid until [DATE]."
                      }
                    }
                  ].map((template, index) => (
                    <motion.div
                      key={template.title}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                      onClick={() => {
                        setSubject(template.template.subject);
                        setMessage(template.template.message);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <template.icon className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-medium">{template.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm">{template.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}