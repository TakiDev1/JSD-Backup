import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Eye, 
  UserCheck,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
  action: string;
  createdAt: string;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissionIds: [] as number[] });
  const [editRole, setEditRole] = useState({ name: "", description: "", permissionIds: [] as number[] });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/admin/roles"],
    queryFn: () => apiRequest("GET", "/api/admin/roles").then(res => res.json())
  });

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/admin/permissions"],
    queryFn: () => apiRequest("GET", "/api/admin/permissions").then(res => res.json())
  });

  // Group permissions by category
  const permissionsByCategory: PermissionsByCategory = permissions.reduce((acc: PermissionsByCategory, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: { name: string; description: string; permissionIds: number[] }) =>
      apiRequest("POST", "/api/admin/roles", roleData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsCreateDialogOpen(false);
      setNewRole({ name: "", description: "", permissionIds: [] });
      toast({
        title: "Role Created",
        description: "New role has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, ...roleData }: { id: number; name: string; description: string; permissionIds: number[] }) =>
      apiRequest("PUT", `/api/admin/roles/${id}`, roleData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role Updated",
        description: "Role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/roles/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      toast({
        title: "Role Deleted",
        description: "Role has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  });

  // Fetch role details with permissions
  const fetchRoleDetails = async (roleId: number) => {
    try {
      const response = await apiRequest("GET", `/api/admin/roles/${roleId}`);
      const roleData = await response.json();
      setSelectedRole(roleData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch role details",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = () => {
    createRoleMutation.mutate(newRole);
  };

  const handleEditRole = () => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, ...editRole });
    }
  };

  const handleDeleteRole = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setEditRole({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissions?.map(p => p.id) || []
    });
    fetchRoleDetails(role.id);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Role Management</h1>
              <p className="text-white/70">Manage user roles and permissions for the platform</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  System Roles
                </CardTitle>
                <CardDescription className="text-white/70">
                  Manage roles that define user permissions and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map((role: Role) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium">{role.name}</h3>
                            {role.isSystem && (
                              <Badge variant="outline" className="border-amber-500 text-amber-400">
                                <Shield className="w-3 h-3 mr-1" />
                                System
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-white/60 text-sm">{role.description}</p>
                          )}
                          <p className="text-white/40 text-xs mt-1">
                            Created {new Date(role.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchRoleDetails(role.id)}
                            className="text-white/70 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                            className="text-white/70 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!role.isSystem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(role)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Role Permissions
                </CardTitle>
                <CardDescription className="text-white/70">
                  {selectedRole ? `Permissions for ${selectedRole.name}` : "Select a role to view permissions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRole ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">{selectedRole.name}</h4>
                      {selectedRole.description && (
                        <p className="text-white/60 text-sm mb-3">{selectedRole.description}</p>
                      )}
                    </div>
                    <Separator className="bg-white/10" />
                    <div>
                      <h5 className="text-white/80 text-sm font-medium mb-3">Assigned Permissions</h5>
                      {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(
                            selectedRole.permissions.reduce((acc: PermissionsByCategory, permission) => {
                              if (!acc[permission.category]) {
                                acc[permission.category] = [];
                              }
                              acc[permission.category].push(permission);
                              return acc;
                            }, {})
                          ).map(([category, categoryPermissions]) => (
                            <div key={category} className="space-y-2">
                              <h6 className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                {category}
                              </h6>
                              <div className="grid grid-cols-1 gap-1">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                    <span className="text-white/60 text-xs">{permission.action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm">No permissions assigned</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">Select a role to view its permissions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Create Role Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription className="text-white/70">
                Create a new role and assign permissions to it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-3 block">Permissions</Label>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-white/80 font-medium capitalize">{category}</h4>
                      <div className="grid grid-cols-1 gap-2 pl-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`create-perm-${permission.id}`}
                              checked={newRole.permissionIds.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewRole({
                                    ...newRole,
                                    permissionIds: [...newRole.permissionIds, permission.id]
                                  });
                                } else {
                                  setNewRole({
                                    ...newRole,
                                    permissionIds: newRole.permissionIds.filter(id => id !== permission.id)
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`create-perm-${permission.id}`}
                              className="text-white/70 text-sm"
                            >
                              {permission.action} - {permission.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={createRoleMutation.isPending || !newRole.name.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createRoleMutation.isPending ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription className="text-white/70">
                Modify role details and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-white">Role Name</Label>
                <Input
                  id="edit-name"
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-white">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-3 block">Permissions</Label>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-white/80 font-medium capitalize">{category}</h4>
                      <div className="grid grid-cols-1 gap-2 pl-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-perm-${permission.id}`}
                              checked={editRole.permissionIds.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditRole({
                                    ...editRole,
                                    permissionIds: [...editRole.permissionIds, permission.id]
                                  });
                                } else {
                                  setEditRole({
                                    ...editRole,
                                    permissionIds: editRole.permissionIds.filter(id => id !== permission.id)
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`edit-perm-${permission.id}`}
                              className="text-white/70 text-sm"
                            >
                              {permission.action} - {permission.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditRole}
                disabled={updateRoleMutation.isPending || !editRole.name.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Role Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Delete Role
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Are you sure you want to delete this role? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {roleToDelete && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-white/80">
                  You are about to delete the role "{roleToDelete.name}". All users assigned to this role will lose their permissions.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRole}
                disabled={deleteRoleMutation.isPending}
                variant="destructive"
              >
                {deleteRoleMutation.isPending ? "Deleting..." : "Delete Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}