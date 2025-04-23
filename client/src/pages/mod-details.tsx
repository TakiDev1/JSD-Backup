import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useModDetails, useModVersions, useCreateReview, useUpdateReview } from "@/hooks/use-mods";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Rating from "@/components/shared/rating";
import ARPreview from "@/components/mods/ar-preview";
import { ShoppingCart, Star, Download, Calendar, Package, Clock, Tag, Heart, Share2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ModVersion, Review } from "@shared/schema";

// Review form schema
const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const ModDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addItem, isModInCart } = useCart();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isARPreviewOpen, setIsARPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch mod details and versions
  const { data: modDetails, isLoading, error } = useModDetails(id);
  const { data: versions } = useModVersions(id);

  const mod = modDetails?.mod || modDetails;
  const latestVersion = modDetails?.latestVersion || versions?.[0];
  // reviews variable is removed as the reviews section is removed

  // Find user's existing review - Removed as reviews section is removed
  //const userReview = reviews.find((review: Review) => review.userId === user?.id);

  // Review form - Removed as reviews section is removed
  // const form = useForm<ReviewFormValues>({
  //   resolver: zodResolver(reviewFormSchema),
  //   defaultValues: {
  //     rating: userReview?.rating || 0,
  //     comment: userReview?.comment || "",
  //   },
  // });

  // Update form when user review changes - Removed as reviews section is removed
  // useEffect(() => {
  //   if (userReview) {
  //     form.reset({
  //       rating: userReview.rating,
  //       comment: userReview.comment || "",
  //     });
  //   }
  // }, [userReview, form]);

  // Review mutations - Removed as reviews section is removed
  // const createReviewMutation = useCreateReview();
  // const updateReviewMutation = useUpdateReview();

  // Handle form submission - Removed as reviews section is removed
  // const onSubmit = (values: ReviewFormValues) => {
  //   if (userReview) {
  //     updateReviewMutation.mutate({
  //       reviewId: userReview.id,
  //       modId: id,
  //       rating: values.rating,
  //       comment: values.comment,
  //     }, {
  //       onSuccess: () => setIsReviewDialogOpen(false)
  //     });
  //   } else {
  //     createReviewMutation.mutate({
  //       modId: id,
  //       rating: values.rating,
  //       comment: values.comment,
  //     }, {
  //       onSuccess: () => setIsReviewDialogOpen(false)
  //     });
  //   }
  // };

  // Check if mod is in cart
  const inCart = isModInCart(id);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addItem(id);
  };

  // Handle download
  const handleDownload = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    window.location.href = `/api/mods/${id}/download`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Mod Not Found</h2>
          <p className="text-neutral-light mb-8">The mod you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/mods")}>Browse Mods</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-xl mb-8">
            <img
              src={mod.thumbnail}
              alt={mod.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
            {mod.featured && (
              <Badge className="absolute top-4 left-4 bg-primary text-white">Featured</Badge>
            )}
            {mod.isSubscriptionOnly && (
              <Badge className="absolute top-4 right-4 bg-secondary text-white">Premium</Badge>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="versions" className="flex-1">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <h2 className="text-2xl font-display font-bold text-white mb-4">Description</h2>
              <div className="text-neutral-light mb-8 whitespace-pre-wrap">
                {mod.description}
              </div>

              <Button variant="outline" onClick={() => setIsARPreviewOpen(true)} className="mb-8">
                <Eye className="mr-2 h-4 w-4" /> View AR Preview
              </Button>

              <h3 className="text-xl font-display font-bold text-white mb-4">Features</h3>
              <ul className="list-disc list-inside text-neutral-light mb-8 ml-4">
                <li>High-quality 3D model with detailed textures</li>
                <li>Realistic physics and handling</li>
                <li>Fully customizable parts and options</li>
                <li>Compatible with all BeamNG.drive versions</li>
                <li>Regular updates and improvements</li>
              </ul>
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
              <h2 className="text-2xl font-display font-bold text-white mb-4">Version History</h2>
              {!versions || versions.length === 0 ? (
                <p className="text-neutral-light">No version history available.</p>
              ) : (
                <div className="space-y-6">
                  {versions.map((version: ModVersion) => (
                    <div key={version.id} className="bg-dark-card p-6 rounded-xl border border-dark-card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-display font-semibold text-white">
                            Version {version.version}
                            {version.isLatest && (
                              <Badge className="ml-2 bg-primary">Latest</Badge>
                            )}
                          </h3>
                          <p className="text-neutral text-sm">
                            Released {formatDistanceToNow(new Date(version.releaseDate), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-neutral">
                          {(version.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>

                      {version.changelog && (
                        <div className="text-neutral-light text-sm whitespace-pre-wrap">
                          {version.changelog}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-dark-card p-6 rounded-xl sticky top-24">
            <h1 className="text-3xl font-display font-bold text-white mb-2">{mod.title}</h1>

            <div className="flex items-center mb-4">
              <Rating value={mod.averageRating} readOnly />
              <span className="ml-2 text-white">
                {mod.averageRating ? mod.averageRating.toFixed(1) : "No ratings"}
              </span>
              <span className="mx-2 text-neutral">•</span>
              <span className="text-neutral">{mod.downloadCount} downloads</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="bg-dark text-secondary">{mod.category}</Badge>
              {mod.tags && mod.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="bg-dark text-secondary">{tag}</Badge>
              ))}
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-light flex items-center">
                  <Package className="mr-2 h-4 w-4" /> Latest Version
                </span>
                <span className="text-white font-medium">
                  {latestVersion?.version || "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-light flex items-center">
                  <Calendar className="mr-2 h-4 w-4" /> Released
                </span>
                <span className="text-white">
                  {latestVersion ? 
                    formatDistanceToNow(new Date(latestVersion.releaseDate), { addSuffix: true }) :
                    formatDistanceToNow(new Date(mod.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-light flex items-center">
                  <Tag className="mr-2 h-4 w-4" /> Price
                </span>
                <span className="text-white font-bold">
                  {mod.discountPrice ? (
                    <span className="flex items-center">
                      <span className="text-neutral-light line-through mr-2">${mod.price.toFixed(2)}</span>
                      ${mod.discountPrice.toFixed(2)}
                    </span>
                  ) : mod.isSubscriptionOnly ? (
                    <span className="text-secondary">Subscription Only</span>
                  ) : (
                    <span>${mod.price.toFixed(2)}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {mod.isSubscriptionOnly ? (
                <Button
                  className="w-full bg-secondary hover:bg-secondary-dark text-white"
                  onClick={() => navigate("/subscribe")}
                >
                  <Clock className="mr-2 h-4 w-4" /> Subscribe to Access
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary hover:bg-primary-light text-white"
                  onClick={handleAddToCart}
                  disabled={inCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {inCart ? "Added to Cart" : "Add to Cart"}
                </Button>
              )}

              {user && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Now
                </Button>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" /> Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AR Preview Dialog */}
      <Dialog open={isARPreviewOpen} onOpenChange={setIsARPreviewOpen}>
        <DialogContent className="max-w-4xl bg-dark-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">
              AR Preview: {mod.title}
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[60vh]">
            <ARPreview modId={id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModDetailsPage;