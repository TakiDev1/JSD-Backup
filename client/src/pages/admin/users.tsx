import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, User, Shield, ShieldCheck, ShieldX, MoreHorizontal, Edit, Trash, Check, X, RefreshCw, Filter, Search, ChevronUp, ChevronDown, UserPlus, UserCheck, ExternalLink } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Must be a valid email address").optional().or(z.literal("")),
  isAdmin: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  isBanned: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userSchema>;

const AdminUsers = () => {
  const { user, isAdmin, getUserAvatar } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get users list
  const { data = { users: [], pagination: { total: 0, pageSize: 10, currentPage: 1 } }, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users', activeTab, sortBy, sortOrder, searchQuery],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      const users = await response.json();
      
      // Filter users based on active tab
      let filteredUsers = users;
      if (activeTab === 'admin') {
        filteredUsers = users.filter((user: any) => user.isAdmin);
      } else if (activeTab === 'premium') {
        filteredUsers = users.filter((user: any) => user.isPremium);
      } else if (activeTab === 'banned') {
        filteredUsers = users.filter((user: any) => user.isBanned);
      }
      
      // Apply search filter
      if (searchQuery) {
        filteredUsers = filteredUsers.filter((user: any) => 
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredUsers.sort((a: any, b: any) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return {
        users: filteredUsers,
        pagination: { total: filteredUsers.length, pageSize: 10, currentPage: 1 }
      };
    },
  });
  
  // Edit user form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      isAdmin: false,
      isPremium: false,
      isBanned: false,
    },
  });
  
  // Update user mutation
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (values: UserFormValues & { id: number }) => {
      const { id, ...userData } = values;
      return apiRequest("PATCH", `/api/admin/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditDialogOpen(false);
      setCurrentUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    }
  });
  
  // Delete user mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });
  
  // Ban/unban user mutation
  const { mutate: toggleBanUser, isPending: isTogglingBan } = useMutation({
    mutationFn: async ({ id, banned }: { id: number, banned: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}/ban`, { banned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Updated",
        description: "User ban status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user ban status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  // Edit user handler
  const handleEditUser = (user: any) => {
    setCurrentUser(user);
    form.reset({
      username: user.username || "",
      email: user.email || "",
      isAdmin: user.isAdmin || false,
      isPremium: user.isPremium || false,
      isBanned: user.isBanned || false,
    });
    setIsEditDialogOpen(true);
  };

  // Delete user handler
  const handleDeleteUser = (user: any) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Ban/unban user handler
  const handleToggleBanUser = (user: any) => {
    toggleBanUser({ id: user.id, banned: !user.isBanned });
  };
  
  // Form submit handler
  const onSubmit = (values: UserFormValues) => {
    if (currentUser) {
      updateUser({ ...values, id: currentUser.id });
    }
  };
  
  // Sort handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-dark-card">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Users</h1>
            <p className="text-neutral-light">View and manage user accounts</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="bg-dark-card border-dark-lighter/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="admin">Admins</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                  <TabsTrigger value="banned">Banned</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        Username
                        {sortBy === "username" && (
                          sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {sortBy === "email" && (
                          sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Join Date
                        {sortBy === "createdAt" && (
                          sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : data.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-neutral-light">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={getUserAvatar(user)} />
                              <AvatarFallback>{user.username?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.isAdmin && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                <Shield className="mr-1 h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            {user.isPremium && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Premium
                              </Badge>
                            )}
                            {!user.isAdmin && !user.isPremium && (
                              <Badge variant="outline">
                                <User className="mr-1 h-3 w-3" />
                                User
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Badge variant="destructive">
                              <X className="mr-1 h-3 w-3" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleBanUser(user)}
                                className={user.isBanned ? "text-green-500" : "text-red-500"}
                              >
                                {user.isBanned ? (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Unban User
                                  </>
                                ) : (
                                  <>
                                    <ShieldX className="mr-2 h-4 w-4" /> Ban User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-dark-card text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Admin</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Premium</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isBanned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Banned</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary-light"
                >
                  {isUpdating ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-card text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="py-4">
              <p className="text-neutral-light">
                User: <span className="text-white font-semibold">{currentUser.username}</span>
              </p>
              <p className="text-neutral-light">
                Email: <span className="text-white">{currentUser.email}</span>
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentUser && deleteUser(currentUser.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Link Discord mutation
  const { mutate: syncPatreonUser, isPending: isSyncingPatreon } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/admin/users/${id}/sync-patreon`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Patreon Status Synced",
        description: "The user's Patreon status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync Patreon status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Edit user handler
  const handleEditUser = (user: any) => {
    setCurrentUser(user);
    form.reset({
      username: user.username,
      email: user.email || "",
      isAdmin: user.isAdmin || false,
      isPremium: user.isPremium || false,
      isBanned: user.isBanned || false,
    });
    setIsEditDialogOpen(true);
  };
  
  // Delete user handler
  const handleDeleteUser = (user: any) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Ban/unban user handler
  const handleToggleBanUser = (user: any) => {
    setCurrentUser(user);
    toggleBanUser({ id: user.id, banned: !user.isBanned });
  };
  
  // Form submit handler
  const onSubmit = (values: UserFormValues) => {
    if (currentUser) {
      updateUser({ ...values, id: currentUser.id });
    }
  };
  
  // Sort handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-dark-card">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Users</h1>
            <p className="text-neutral-light">View and manage user accounts</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="bg-dark-card border-dark-lighter/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="admin">Admins</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                  <TabsTrigger value="banned">Banned</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("username")}>
                      User
                      {sortBy === "username" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                      Email
                      {sortBy === "email" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                      Joined
                      {sortBy === "createdAt" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-10 w-10 text-neutral" />
                          <p>No users found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.users.map((user: any) => (
                      <TableRow key={user.id} className="hover:bg-dark-lighter/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getUserAvatar(user)} alt={user.username} />
                              <AvatarFallback className="bg-primary text-white">
                                {user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{user.username}</span>
                              {user.discordId && (
                                <span className="text-xs text-neutral-light flex items-center gap-1">
                                  <i className="fab fa-discord"></i> Connected
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.email || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.isAdmin && (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                Admin
                              </Badge>
                            )}
                            {user.isPremium && (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                                Premium
                              </Badge>
                            )}
                            {user.isBanned && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                Banned
                              </Badge>
                            )}
                            {!user.isAdmin && !user.isPremium && !user.isBanned && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                Standard
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => syncPatreonUser(user.id)}>
                                <UserCheck className="mr-2 h-4 w-4" /> Sync Patreon
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleBanUser(user)}
                                className={user.isBanned ? "text-green-500" : "text-red-500"}
                              >
                                {user.isBanned ? (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Unban User
                                  </>
                                ) : (
                                  <>
                                    <ShieldX className="mr-2 h-4 w-4" /> Ban User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-dark-card">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription>Update the user details below.</DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-md">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getUserAvatar(currentUser)} alt={currentUser.username} />
                <AvatarFallback className="bg-primary text-white">
                  {currentUser.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-white">{currentUser.username}</h4>
                <p className="text-sm text-neutral-light">
                  {currentUser.discordId ? (
                    <span className="flex items-center gap-1">
                      <i className="fab fa-discord"></i> Connected to Discord
                    </span>
                  ) : "No Discord connection"}
                </p>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel className="text-base">Administrator</FormLabel>
                        <FormDescription>
                          Grant full admin privileges to this user
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel className="text-base">Premium User</FormLabel>
                        <FormDescription>
                          Grant access to premium/subscription content
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isBanned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel className="text-base">Banned</FormLabel>
                        <FormDescription>
                          Prevent user from accessing the site
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary-light"
                >
                  {isUpdating ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-dark-card">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-md">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getUserAvatar(currentUser)} alt={currentUser.username} />
                <AvatarFallback className="bg-primary text-white">
                  {currentUser.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-white">{currentUser.username}</h4>
                <p className="text-sm text-neutral-light">Joined: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          
          <Alert variant="destructive" className="bg-red-950 border-red-900">
            <AlertTitle className="text-red-400">Warning</AlertTitle>
            <AlertDescription className="text-neutral-light">
              Deleting this user will remove all their data, including purchases, reviews, and forum posts.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentUser && deleteUser(currentUser.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;