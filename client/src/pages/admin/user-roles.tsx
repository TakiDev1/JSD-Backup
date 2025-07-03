import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus,
  Shield, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Crown,
  Zap,
  AlertTriangle
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  roles?: Role[];
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

export default function UserRolesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkRoleAction, setBulkRoleAction] = useState<"assign" | "remove">("assign");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch all users with their roles
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users-with-roles'],
  });

  // Fetch all roles
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/admin/roles'],
  });

  // Bulk role assignment mutation
  const bulkRoleAssignMutation = useMutation({
    mutationFn: async ({ userIds, roleId, action }: { userIds: number[], roleId: number, action: "assign" | "remove" }) => {
      const response = await apiRequest('POST', '/api/admin/bulk-role-assignment', {
        userIds,
        roleId,
        action
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Roles ${bulkRoleAction === 'assign' ? 'assigned to' : 'removed from'} ${selectedUsers.length} users`,
      });
      setSelectedUsers([]);
      setSelectedRole("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-with-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update roles",
        variant: "destructive",
      });
    },
  });

  // Individual role assignment mutation
  const roleAssignMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number, roleIds: number[] }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/roles`, {
        roleIds
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
      setShowRoleDialog(false);
      setCurrentUserId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-with-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user roles",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUserSelect = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkRoleAction = () => {
    if (!selectedRole || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users and a role",
        variant: "destructive",
      });
      return;
    }

    const roleId = parseInt(selectedRole);
    bulkRoleAssignMutation.mutate({
      userIds: selectedUsers,
      roleId,
      action: bulkRoleAction
    });
  };

  const openRoleDialog = (userId: number) => {
    setCurrentUserId(userId);
    setShowRoleDialog(true);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'admin': return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'moderator': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'premium_user': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'moderator': return <CheckCircle className="h-3 w-3" />;
      case 'premium_user': return <Zap className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const currentUser = currentUserId ? users?.find(u => u.id === currentUserId) : null;

  if (usersLoading || rolesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              User Role Management
            </h1>
            <p className="text-muted-foreground">
              Quickly assign and manage user roles across your platform
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
              >
                <Badge variant="secondary" className="text-sm">
                  {selectedUsers.length} users selected
                </Badge>
                
                <Select value={bulkRoleAction} onValueChange={(value: "assign" | "remove") => setBulkRoleAction(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign">Assign Role</SelectItem>
                    <SelectItem value="remove">Remove Role</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleBulkRoleAction}
                  disabled={!selectedRole || bulkRoleAssignMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {bulkRoleAssignMutation.isPending ? "Processing..." : `${bulkRoleAction === 'assign' ? 'Assign' : 'Remove'} Role`}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear Selection
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Current Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleUserSelect(user.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          {user.email && (
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.roles?.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className={`text-xs ${getRoleColor(role.name)}`}
                            >
                              <div className="flex items-center gap-1">
                                {getRoleIcon(role.name)}
                                {role.name}
                              </div>
                            </Badge>
                          )) || <span className="text-muted-foreground text-sm">No roles</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.isAdmin && (
                            <Badge variant="default" className="w-fit text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.isBanned && (
                            <Badge variant="destructive" className="w-fit text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          )}
                          {!user.isAdmin && !user.isBanned && (
                            <Badge variant="secondary" className="w-fit text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user.id)}
                          className="text-xs"
                        >
                          Manage Roles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Roles for {currentUser?.username}</DialogTitle>
              <DialogDescription>
                Select the roles you want to assign to this user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {roles?.map((role) => {
                const isAssigned = currentUser?.roles?.some(userRole => userRole.id === role.id) || false;
                
                return (
                  <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={isAssigned}
                      onCheckedChange={(checked) => {
                        if (!currentUser) return;
                        
                        const currentRoleIds = currentUser.roles?.map(r => r.id) || [];
                        let newRoleIds;
                        
                        if (checked) {
                          newRoleIds = [...currentRoleIds, role.id];
                        } else {
                          newRoleIds = currentRoleIds.filter(id => id !== role.id);
                        }
                        
                        roleAssignMutation.mutate({
                          userId: currentUser.id,
                          roleIds: newRoleIds
                        });
                      }}
                      disabled={roleAssignMutation.isPending}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        <label htmlFor={`role-${role.id}`} className="text-sm font-medium cursor-pointer">
                          {role.name}
                        </label>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowRoleDialog(false)}
                disabled={roleAssignMutation.isPending}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}