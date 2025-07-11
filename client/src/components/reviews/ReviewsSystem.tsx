import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, VerifiedIcon, User, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Review {
  id: number;
  userId: number;
  modId: number;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  isHelpful: number;
  createdAt: string;
  user: {
    discordUsername: string;
    discordAvatar: string;
  };
}

interface ReviewsSystemProps {
  modId: number;
}

const ReviewsSystem: React.FC<ReviewsSystemProps> = ({ modId }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch reviews for this mod
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [`/api/mods/${modId}/reviews`],
    queryFn: () => fetch(`/api/mods/${modId}/reviews`).then(res => res.json()),
  });

  // Check if user has purchased this mod
  const { data: hasPurchased } = useQuery({
    queryKey: [`/api/mods/${modId}/purchased`],
    queryFn: () => fetch(`/api/mods/${modId}/purchased`).then(res => res.json()),
    enabled: !!isAuthenticated,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await fetch(`/api/mods/${modId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/mods/${modId}/reviews`] });
      setShowReviewForm(false);
      setRating(0);
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.message,
      });
    },
  });

  // Mark review as helpful mutation
  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark as helpful');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mods/${modId}/reviews`] });
    },
  });

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please log in to submit a review.",
      });
      return;
    }

    if (rating === 0 || !title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields and select a rating.",
      });
      return;
    }

    submitReviewMutation.mutate({
      rating,
      title: title.trim(),
      content: content.trim(),
    });
  };

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviews.length;
  const userHasReviewed = reviews.some((review: Review) => review.userId === user?.id);

  const ratingCounts = [5, 4, 3, 2, 1].map(star => 
    reviews.filter((review: Review) => review.rating === star).length
  );

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-white">Customer Reviews</span>
            {totalReviews > 0 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {averageRating.toFixed(1)} ★ ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Breakdown */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= averageRating ? "text-yellow-400 fill-current" : "text-slate-500"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-400">{totalReviews} reviews</div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star, index) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm text-slate-400 w-8">{star}★</span>
                      <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-yellow-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: totalReviews > 0 ? `${(ratingCounts[index] / totalReviews) * 100}%` : "0%"
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-8">{ratingCounts[index]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Button */}
              <div className="flex flex-col justify-center">
                {isAuthenticated ? (
                  hasPurchased?.purchased ? (
                    !userHasReviewed ? (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    ) : (
                      <div className="text-center text-slate-400">
                        <VerifiedIcon className="h-8 w-8 mx-auto mb-2 text-green-400" />
                        You've already reviewed this mod
                      </div>
                    )
                  ) : (
                    <div className="text-center text-slate-400">
                      <div className="text-sm">Purchase this mod to leave a review</div>
                    </div>
                  )
                ) : (
                  <div className="text-center text-slate-400">
                    <div className="text-sm">Login to leave a review</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-slate-400 mb-4">Be the first to review this mod!</p>
              {isAuthenticated && hasPurchased?.purchased && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                >
                  Write the First Review
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Write Your Review
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-400 fill-current"
                              : "text-slate-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Review Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Review
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell others about your experience with this mod..."
                    rows={4}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Reviews</h3>
          {reviews.map((review: Review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-900/80 border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.discordAvatar} />
                      <AvatarFallback className="bg-slate-700">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">
                          {review.user.discordUsername}
                        </span>
                        {review.isVerifiedPurchase && (
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                            <VerifiedIcon className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                        <span className="text-sm text-slate-400">
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "text-yellow-400 fill-current" : "text-slate-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-white mb-2">{review.title}</h4>
                      <p className="text-slate-300 leading-relaxed mb-3">{review.content}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => helpfulMutation.mutate(review.id)}
                          className="text-slate-400 hover:text-green-400 h-8 px-2"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful ({review.isHelpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSystem;