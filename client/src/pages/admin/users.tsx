import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart,
  Loader2,
  Users,
  Package,
  MoreVertical,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  User,
  Shield,
  ShieldOff,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: 1,
    username: "JohnDoe",
    email: "john@example.com",
    discordId: "123456789",
    discordAvatar: null,
    isAdmin: false,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    createdAt: new Date(2023, 1, 15).toISOString(),
    lastLogin: new Date(2023, 5, 20).toISOString()
  },
  {
    id: 2,
    username: "JaneDoe",
    email: "jane@example.com",
    discordId: "987654321",
    discordAvatar: null,
    isAdmin: true,
    stripeCustomerId: "cus_456",
    stripeSubscriptionId: null,
    createdAt: new Date(2023, 2, 20).toISOString(),
    lastLogin: new Date(2023, 5, 22).toISOString()
  },
  {
    id: 3,
    username: "AliceSmith",
    email: "alice@example.com",
    discordId: "456789123",
    discordAvatar: null,
    isAdmin: false,
    stripeCustomerId: "cus_789",
    stripeSubscriptionId: "sub_789",
    createdAt: new Date(2023, 3, 10).toISOString(),
    lastLogin: new Date(2023, 5, 18).toISOString()
  }
];

const AdminUsers = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAdmin, getUserAvatar } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  
  // Normally we'd fetch users from the API
  // For demo, we'll use mock data
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    // This would be the real API call
    // queryFn: () => apiRequest("GET", "/api/admin/users").then(res => res.json()),
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return MOCK_USERS;
    }
  });
  
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => {
      // This would be the real API call
      // return apiRequest("PATCH", `/api/admin/users/${userId}`, { isAdmin }).then(res => res.json())
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User role updated",
        description: "The user's role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  });
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else if (!isAdmin) {
      navigate("/profile");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const handleToggleAdmin = (userId: number, currentIsAdmin: boolean) => {
    updateUserRoleMutation.mutate({ 
      userId, 
      isAdmin: !currentIsAdmin 
    });
  };
  
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <Card className="bg-dark-card">
          <CardContent className="flex flex-col items-center pt-6">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">
              Checking permissions...
            </h3>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/5">
          <Card className="bg-dark-card sticky top-24">
            <CardHeader>
              <CardTitle className="font-display text-white flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin")}
                >
                  <BarChart className="mr-2 h-4 w-4" /> 
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/mods")}
                >
                  <Package className="mr-2 h-4 w-4" /> 
                  Manage Mods
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-primary/20 hover:bg-primary/30 text-primary"
                >
                  <Users className="mr-2 h-4 w-4" /> 
                  Manage Users
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-4/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              Manage Users
            </h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-light h-4 w-4" />
              <Input 
                type="text"
                placeholder="Search users..."
                className="pl-10 bg-dark-lighter border-dark-lighter w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Card className="bg-dark-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-neutral-light">No users found matching your search.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Discord ID</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={user.discordAvatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png` : undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.email || "—"}
                        </TableCell>
                        <TableCell>
                          {user.discordId ? (
                            <Badge variant="outline" className="bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30">
                              {user.discordId}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {user.stripeSubscriptionId ? (
                            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-neutral-light">
                              None
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-neutral-light">
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-light">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-light">
                          {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-dark-card border-dark-lighter">
                              <DropdownMenuItem 
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                className="cursor-pointer"
                              >
                                <User className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                className="cursor-pointer"
                                disabled={updateUserRoleMutation.isPending}
                              >
                                {user.isAdmin ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;