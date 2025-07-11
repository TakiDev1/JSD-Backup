import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Ticket, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Calendar,
  User,
  Edit,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  userId?: number;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  user?: {
    id: number;
    username: string;
  };
  assignedToUser?: {
    id: number;
    username: string;
  };
}

interface CreateTicketData {
  title: string;
  description: string;
  priority: string;
  category: string;
  assignedTo?: number;
}

export default function SupportTickets() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/admin/support-tickets'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketData) => {
      const response = await apiRequest("POST", "/api/admin/support-tickets", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ticket");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
      setIsCreateDialogOpen(false);
      setCreateFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
      });
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SupportTicket> }) => {
      const response = await apiRequest("PATCH", `/api/admin/support-tickets/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ticket");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/support-tickets/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete ticket");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-600';
      case 'in_progress': return 'bg-purple-600';
      case 'resolved': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageSquare className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleCreateTicket = () => {
    createTicketMutation.mutate(createFormData);
  };

  const handleUpdateTicketStatus = (id: number, status: string) => {
    updateTicketMutation.mutate({ 
      id, 
      data: { 
        status: status as any,
        closedAt: status === 'closed' ? new Date().toISOString() : undefined
      } 
    });
  };

  const handleDeleteTicket = (id: number) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicketMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
              <p className="text-slate-400">Manage customer support requests</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                    className="bg-slate-800 border-slate-600"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={createFormData.priority} 
                      onValueChange={(value) => setCreateFormData({...createFormData, priority: value})}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={createFormData.category} 
                      onValueChange={(value) => setCreateFormData({...createFormData, category: value})}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTicket}
                    disabled={createTicketMutation.isPending || !createFormData.title || !createFormData.description}
                    className="bg-gradient-to-r from-purple-600 to-green-600"
                  >
                    {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Tickets</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Open</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">In Progress</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.inProgress}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Resolved</p>
                    <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tickets Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              All Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs`}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(ticket.status)} text-white text-xs flex items-center`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-slate-300 mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.user && (
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {ticket.user.username}
                          </span>
                        )}
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          {ticket.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {tickets.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">No support tickets yet</h3>
                  <p className="text-slate-500">Create your first support ticket to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}