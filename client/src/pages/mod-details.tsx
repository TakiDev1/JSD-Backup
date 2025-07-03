import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation } from "wouter";
import { useModDetails, useModVersions } from "@/hooks/use-mods";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import Rating from "@/components/shared/rating";
import { ShoppingCart, Star, Download, Calendar, Package, Clock, Tag, Heart, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ModVersion } from "@shared/schema";

// Function to render description with embedded images (including GIFs)
const renderDescriptionWithImages = (description: string) => {
  if (!description) return null;
  
  // Regular expression to match image syntax: ![alt text](image_url)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  // Split the description by image markers
  const parts = description.split(imageRegex);
  const matches = description.match(imageRegex) || [];
  
  // Build the result array
  const result = [];
  
  // Add the first text part
  if (parts[0]) {
    result.push(<Fragment key="text-0">{parts[0]}</Fragment>);
  }
  
  // Add image and text parts
  let textIndex = 1;
  matches.forEach((match, index) => {
    // Extract alt text and URL from the match
    const altMatch = match.match(/!\[(.*?)\]/);
    const urlMatch = match.match(/\((.*?)\)/);
    
    if (altMatch && urlMatch) {
      const alt = altMatch[1];
      const url = urlMatch[1];
      
      // Check if it's a GIF (case insensitive)
      const isGif = url.toLowerCase().endsWith('.gif');
      
      // Add the image
      result.push(
        <div key={`img-${index}`} className="my-4">
          <img 
            src={url} 
            alt={alt} 
            className={`rounded-lg max-w-full mx-auto ${isGif ? 'max-h-[800px]' : 'max-h-[600px]'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/mod-placeholder.jpg";
            }}
          />
          {alt && <p className="text-center text-sm text-neutral mt-2">{alt}</p>}
        </div>
      );
      
      // Add the next text part if it exists
      if (parts[textIndex]) {
        result.push(<Fragment key={`text-${textIndex}`}>{parts[textIndex]}</Fragment>);
      }
      
      textIndex += 2; // Skip to the next text part (after alt and url)
    }
  });
  
  return result;
};

const ModDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addItem, isModInCart, isPending } = useCart();
  const { toast } = useToast();
  // Review dialog and AR preview removed
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch mod details and versions
  const { data: modDetails, isLoading, error } = useModDetails(id);
  const { data: versions } = useModVersions(id);

  // Ensure we have a mod object with proper fallbacks
  const mod = modDetails?.mod || null;
  const latestVersion = modDetails?.latestVersion || (Array.isArray(versions) && versions.length > 0 ? versions[0] : null);

  // State to track if mod is in cart
  const [inCart, setInCart] = useState(false);
  
  // Update cart status when needed
  useEffect(() => {
    if (id && !isNaN(id)) {
      setInCart(isModInCart(id));
    }
  }, [id, isModInCart]);

  // Function to create flying cart animation
  const createFlyingAnimation = (button: HTMLElement) => {
    try {
      const cartButton = document.querySelector('.cart-button') as HTMLElement;
      if (!button || !cartButton) return;
      
      const buttonRect = button.getBoundingClientRect();
      const cartRect = cartButton.getBoundingClientRect();
      
      // Create flying element
      const flyingItem = document.createElement('div');
      flyingItem.className = 'flying-cart-item';
      flyingItem.style.position = 'fixed';
      flyingItem.style.zIndex = '9999';
      flyingItem.style.width = '30px';
      flyingItem.style.height = '30px';
      flyingItem.style.borderRadius = '50%';
      flyingItem.style.background = 'white';
      flyingItem.style.boxShadow = '0 0 15px rgba(115, 0, 255, 0.8)';
      flyingItem.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      flyingItem.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
      flyingItem.style.pointerEvents = 'none';
      
      document.body.appendChild(flyingItem);
      
      // Animate
      const animation = flyingItem.animate([
        { 
          left: `${buttonRect.left + buttonRect.width / 2}px`,
          top: `${buttonRect.top + buttonRect.height / 2}px`,
          opacity: 1,
          transform: 'scale(1)'
        },
        { 
          left: `${cartRect.left + cartRect.width / 2}px`,
          top: `${cartRect.top + cartRect.height / 2}px`,
          opacity: 0,
          transform: 'scale(0.5)'
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
      });
      
      animation.onfinish = () => {
        if (document.body.contains(flyingItem)) {
          document.body.removeChild(flyingItem);
        }
      };
    } catch (error) {
      console.error("Animation error:", error);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async (e?: React.MouseEvent) => {
    console.log("Add to cart clicked, auth status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    
    // Prevent action if already in cart or processing
    if (inCart || isPending) {
      console.log("Already in cart or request pending, ignoring click");
      return;
    }
    
    // Very first check - if not authenticated, stop immediately with no animations or UI changes
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, redirecting to auth page");
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    try {
      console.log("=== ADD TO CART BUTTON CLICKED ===");
      console.log("Mod info:", mod);
      console.log("Mod ID:", id, "Type:", typeof id);
      console.log("Starting add to cart process for mod ID:", id);
      
      // Optimistically update UI - only if we're authenticated
      setInCart(true);
      console.log("UI state updated (optimistically)");
      
      // Create flying animation only if authenticated
      if (e && isAuthenticated && user) {
        const button = e.currentTarget as HTMLElement;
        console.log("Starting animation");
        createFlyingAnimation(button);
      }
      
      // Add to cart
      console.log("Calling addItem with mod ID:", id);
      const result = await addItem(id);
      console.log("Add to cart result:", result);
      console.log("Is mod in cart after operation:", isModInCart(id));
      
      toast({
        title: "Added to cart",
        description: `${mod.title} has been added to your cart.`
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // Reset UI state on error
      setInCart(isModInCart(id));
      
      toast({
        title: "Error",
        description: "Failed to add this mod to your cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to auth page");
      toast({
        title: "Authentication required",
        description: "Please sign in to download this mod",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    window.location.href = `/api/mods/${id}/download`;
  };

  // Handle share
  const handleShare = async () => {
    if (!mod) return;

    const url = window.location.href;
    const title = mod.title;
    const text = `Check out this BeamNG mod: ${mod.title}`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        toast({
          title: "Shared successfully",
          description: "Mod shared successfully!",
        });
      } catch (error) {
        // User cancelled the share or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to clipboard
          fallbackShare(url);
        }
      }
    } else {
      // Fallback to clipboard
      fallbackShare(url);
    }
  };

  // Fallback share function - copy to clipboard
  const fallbackShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Mod link copied to clipboard!",
      });
    } catch (error) {
      // Final fallback - show URL in prompt
      console.error('Clipboard not supported:', error);
      toast({
        title: "Share Link",
        description: "Copy this link to share: " + url,
      });
    }
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
              src={mod.previewImageUrl || "/images/mod-placeholder.jpg"}
              alt={mod.title}
              className="w-full h-[400px] object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/mod-placeholder.jpg";
              }}
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
                {renderDescriptionWithImages(mod.description)}
              </div>

              {mod.features && Array.isArray(mod.features) && mod.features.length > 0 ? (
                <>
                  <h3 className="text-xl font-display font-bold text-white mb-4">Features</h3>
                  <ul className="list-disc list-inside text-neutral-light mb-8 ml-4">
                    {mod.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              ) : null}
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
              {mod.tags && Array.isArray(mod.tags) && mod.tags.map((tag: string) => (
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
                    <span className="text-secondary">Premium Only</span>
                  ) : (
                    `$${mod.price.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-8">
              {mod.isSubscriptionOnly && !user?.isPremium ? (
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90"
                  onClick={() => navigate("/subscribe")}
                >
                  <Clock className="mr-2 h-4 w-4" /> Subscribe For Access
                </Button>
              ) : user?.isPremium && mod.isSubscriptionOnly ? (
                <Button 
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              ) : user && user.purchases?.some((p: any) => p.modId === id) ? (
                <Button 
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={inCart || isPending}
                >
                  {inCart ? (
                    <>
                      <span className="mr-2">✓</span> In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </>
                  )}
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1" title="Share" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                {isAuthenticated && (
                  <Button variant="outline" size="icon" className="flex-1" title="Favorite">
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModDetailsPage;