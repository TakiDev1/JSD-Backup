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
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModsList, useDeleteMod } from "@/hooks/use-mods";

const AdminMods = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modToDelete, setModToDelete] = useState<number | null>(null);
  
  // Get mods list
  const { data, isLoading, error } = useModsList({});
  const deleteMutation = useDeleteMod();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else if (!isAdmin) {
      navigate("/profile");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Mod deleted",
        description: "The mod has been successfully deleted.",
      });
      setDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mod",
        variant: "destructive",
      });
    }
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
  
  const filteredMods = data?.mods.filter(mod => 
    mod.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mod.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                  variant="default" 
                  className="w-full justify-start bg-primary/20 hover:bg-primary/30 text-primary"
                >
                  <Package className="mr-2 h-4 w-4" /> 
                  Manage Mods
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/users")}
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
              Manage Mods
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-light h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search mods..."
                  className="pl-10 bg-dark-lighter border-dark-lighter w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => navigate("/admin/mods/new")}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mod
              </Button>
            </div>
          </div>
          
          <Card className="bg-dark-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-neutral-light">Failed to load mods. Please try again.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-neutral-light">
                          No mods found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMods.map((mod) => (
                        <TableRow key={mod.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-md bg-dark-lighter overflow-hidden mr-3">
                                {mod.thumbnail && (
                                  <img 
                                    src={mod.thumbnail} 
                                    alt={mod.title} 
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="text-white">{mod.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-dark-lighter text-neutral-light">
                              {mod.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {mod.discountPrice ? (
                              <div className="flex flex-col">
                                <span className="text-white">${mod.discountPrice.toFixed(2)}</span>
                                <span className="text-neutral-light line-through text-xs">${mod.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-white">${mod.price.toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {mod.isFeatured ? (
                              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Featured</Badge>
                            ) : (
                              <Badge variant="outline" className="text-neutral-light">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {mod.isSubscriptionOnly ? (
                              <Badge className="bg-secondary/20 text-secondary border-secondary/30">Premium</Badge>
                            ) : (
                              <Badge variant="outline" className="text-neutral-light">Regular</Badge>
                            )}
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
                                  onClick={() => navigate(`/admin/mods/edit/${mod.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setModToDelete(mod.id);
                                    setDeleteModalOpen(true);
                                  }}
                                  className="cursor-pointer text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-dark-card border-dark-lighter">
          <DialogHeader>
            <DialogTitle className="text-white font-display">Delete Mod</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mod? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => modToDelete !== null && handleDelete(modToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMods;