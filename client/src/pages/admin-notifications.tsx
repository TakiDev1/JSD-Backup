import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Send, History, AlertCircle, CheckCircle } from "lucide-react";
import { Mod } from "@shared/schema";

interface NotificationLog {
  id: number;
  modId: number;
  modTitle: string;
  version: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [selectedModId, setSelectedModId] = useState<string>("");
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");

  // Fetch mods for dropdown
  const { data: mods = [] } = useQuery<Mod[]>({
    queryKey: ["/api/mods"],
  });

  // Fetch notification history
  const { data: notificationHistory = [] } = useQuery<NotificationLog[]>({
    queryKey: ["/api/admin/notifications/history"],
  });

  // Send manual notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { modId: number; version: string; changelog?: string }) => {
      const response = await apiRequest("POST", "/api/admin/notifications/send", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Notification sent successfully",
        description: `Notified ${data.recipientCount} users about the update`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/history"] });
      // Reset form
      setSelectedModId("");
      setVersion("");
      setChangelog("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendNotification = () => {
    if (!selectedModId || !version) {
      toast({
        title: "Missing information",
        description: "Please select a mod and enter a version number",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate({
      modId: parseInt(selectedModId),
      version,
      changelog: changelog || undefined,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center space-x-2">
        <Mail className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Notification Management</h1>
      </div>

      {/* Manual Notification Sender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Manual Notification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mod-select">Select Mod</Label>
              <Select value={selectedModId} onValueChange={setSelectedModId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mod..." />
                </SelectTrigger>
                <SelectContent>
                  {mods.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id.toString()}>
                      {mod.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version Number</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 2.1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changelog">Changelog (Optional)</Label>
            <Textarea
              id="changelog"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="What's new in this version..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={sendNotificationMutation.isPending}
            className="w-full md:w-auto"
          >
            {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Notification History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificationHistory.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{log.modTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Version {log.version}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <span>{log.recipientCount} recipients</span>
                    </Badge>
                    
                    {log.successCount > 0 && (
                      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3" />
                        <span>{log.successCount} sent</span>
                      </Badge>
                    )}
                    
                    {log.failureCount > 0 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{log.failureCount} failed</span>
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}