import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, MoreHorizontal, Edit, Trash, Star, Download, Eye, Car, Truck, Tag, DollarSign, FileText, ChevronUp, ChevronDown, Search, Filter, RefreshCw } from "lucide-react";
import { MOD_CATEGORIES } from "@/lib/constants";

// Form schema for creating/editing a mod
const modSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a valid number ≥ 0",
  }),
  category: z.string().min(1, "Please select a category"),
  previewImageUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  downloadUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  version: z.string().min(1, "Version is required"),
  isFeatured: z.boolean().default(false),
  isSubscriptionOnly: z.boolean().default(false),
  releaseNotes: z.string().optional(),
  tags: z.string().optional(),
});

type ModFormValues = z.infer<typeof modSchema>;

const AdminMods = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMod, setCurrentMod] = useState<any>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Get mods list
  const { data = { mods: [], pagination: { total: 0, pageSize: 10, currentPage: 1 } }, isLoading: modsLoading, refetch: refetchMods } = useQuery({
    queryKey: ['/api/admin/mods', activeTab, sortBy, sortOrder, searchQuery, filterCategory],
    queryFn: async () => {
      return {
        mods: [],
        pagination: { total: 0, pageSize: 10, currentPage: 1 }
      };
    },
  });
  
  // Create mod form
  const form = useForm<ModFormValues>({
    resolver: zodResolver(modSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      category: "",
      previewImageUrl: "",
      downloadUrl: "",
      version: "1.0.0",
      isFeatured: false,
      isSubscriptionOnly: false,
      releaseNotes: "",
      tags: "",
    },
  });
  
  // Create mod mutation
  const { mutate: createMod, isPending: isCreating } = useMutation({
    mutationFn: async (values: ModFormValues) => {
      const formattedValues = {
        ...values,
        price: parseFloat(values.price),
        tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
      };
      return apiRequest("POST", "/api/admin/mods", formattedValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Mod Created",
        description: "The mod has been created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create mod. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update mod mutation
  const { mutate: updateMod, isPending: isUpdating } = useMutation({
    mutationFn: async (values: ModFormValues & { id: number }) => {
      const { id, ...modData } = values;
      const formattedValues = {
        ...modData,
        price: parseFloat(modData.price),
        tags: modData.tags ? modData.tags.split(",").map(tag => tag.trim()) : [],
      };
      return apiRequest("PATCH", `/api/admin/mods/${id}`, formattedValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Mod Updated",
        description: "The mod has been updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update mod. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete mod mutation
  const { mutate: deleteMod, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/mods/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Mod Deleted",
        description: "The mod has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentMod(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete mod. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Edit mod handler
  const handleEditMod = (mod: any) => {
    setCurrentMod(mod);
    form.reset({
      title: mod.title,
      description: mod.description,
      price: mod.price.toString(),
      category: mod.category,
      previewImageUrl: mod.previewImageUrl || "",
      downloadUrl: mod.downloadUrl || "",
      version: mod.version || "1.0.0",
      isFeatured: mod.isFeatured || false,
      isSubscriptionOnly: mod.isSubscriptionOnly || false,
      releaseNotes: mod.releaseNotes || "",
      tags: mod.tags ? mod.tags.join(", ") : "",
    });
    setIsEditDialogOpen(true);
  };
  
  // Delete mod handler
  const handleDeleteMod = (mod: any) => {
    setCurrentMod(mod);
    setIsDeleteDialogOpen(true);
  };
  
  // Form submit handler
  const onSubmit = (values: ModFormValues) => {
    if (currentMod) {
      updateMod({ ...values, id: currentMod.id });
    } else {
      createMod(values);
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
  
  // Filter by category
  const handleFilterByCategory = (category: string) => {
    setFilterCategory(category);
  };
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen) {
      form.reset();
      setCurrentMod(null);
    }
  }, [isCreateDialogOpen, isEditDialogOpen, form]);
  
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
            <h1 className="text-3xl font-bold text-white">Manage Mods</h1>
            <p className="text-neutral-light">Create, edit and manage your BeamNG drive mods</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-light">
                <Plus className="mr-2 h-4 w-4" /> Add New Mod
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-dark-card max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Mod</DialogTitle>
                <DialogDescription>Fill out the form below to create a new mod.</DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mod title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MOD_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="previewImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preview Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="downloadUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/mod.zip" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="car, truck, offroad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-6 items-center md:col-span-2">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Featured Mod</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isSubscriptionOnly"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Subscription Only</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter detailed description of the mod" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="releaseNotes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Release Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter release notes" 
                              className="min-h-[80px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="bg-primary hover:bg-primary-light"
                    >
                      {currentMod ? (isUpdating ? "Updating..." : "Update Mod") : (isCreating ? "Creating..." : "Create Mod")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="bg-dark-card border-dark-lighter/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All Mods</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription Only</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search mods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs"
                  />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFilterByCategory("")}>
                        All Categories
                      </DropdownMenuItem>
                      {MOD_CATEGORIES.map((category) => (
                        <DropdownMenuItem 
                          key={category.value}
                          onClick={() => handleFilterByCategory(category.value)}
                        >
                          {category.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" size="icon" onClick={() => refetchMods()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                      Title
                      {sortBy === "title" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                      Category
                      {sortBy === "category" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                      Price
                      {sortBy === "price" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("version")}>
                      Version
                      {sortBy === "version" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                      Created
                      {sortBy === "createdAt" && (
                        sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Loading mods...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data.mods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="h-10 w-10 text-neutral" />
                          <p>No mods found</p>
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="mt-2"
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Your First Mod
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.mods.map((mod: any) => (
                      <TableRow key={mod.id} className="hover:bg-dark-lighter/50">
                        <TableCell className="font-medium flex items-center gap-2">
                          {mod.previewImageUrl ? (
                            <img 
                              src={mod.previewImageUrl} 
                              alt={mod.title} 
                              className="h-8 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-8 w-12 bg-dark-lighter rounded flex items-center justify-center">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <span className="truncate max-w-[200px]">{mod.title}</span>
                        </TableCell>
                        <TableCell>{mod.category}</TableCell>
                        <TableCell>${mod.price.toFixed(2)}</TableCell>
                        <TableCell>{mod.version || "1.0.0"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {mod.isFeatured && (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                Featured
                              </Badge>
                            )}
                            {mod.isSubscriptionOnly && (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                                Subscription
                              </Badge>
                            )}
                            {!mod.isFeatured && !mod.isSubscriptionOnly && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                Standard
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(mod.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMod(mod)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/mod-details?id=${mod.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMod(mod)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
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
      
      {/* Edit Mod Dialog - Reusing the create dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-dark-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Mod</DialogTitle>
            <DialogDescription>Update the mod details below.</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mod title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOD_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="previewImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/mod.zip" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="car, truck, offroad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-6 items-center md:col-span-2">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Featured Mod</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isSubscriptionOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Subscription Only</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed description of the mod" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="releaseNotes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Release Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter release notes" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
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
                  {isUpdating ? "Updating..." : "Update Mod"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-dark-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mod? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentMod && (
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-md">
              {currentMod.previewImageUrl ? (
                <img 
                  src={currentMod.previewImageUrl} 
                  alt={currentMod.title} 
                  className="h-12 w-16 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-16 bg-dark-lighter rounded flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-white">{currentMod.title}</h4>
                <p className="text-sm text-neutral-light">{currentMod.category} · ${currentMod.price.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <Alert variant="destructive" className="bg-red-950 border-red-900">
            <AlertTitle className="text-red-400">Warning</AlertTitle>
            <AlertDescription className="text-neutral-light">
              Deleting this mod will remove all associated data, including reviews, purchase records, and download history.
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
              onClick={() => currentMod && deleteMod(currentMod.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Mod"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMods;