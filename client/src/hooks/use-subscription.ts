import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan, SubscriptionBenefit } from "@shared/schema";

/**
 * Hook to manage subscription data and operations
 */
export function useSubscription() {
  const { toast } = useToast();
  
  // Get subscription plans
  const { 
    data: plans, 
    isLoading: plansLoading, 
    error: plansError 
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get subscription benefits
  const { 
    data: benefits, 
    isLoading: benefitsLoading, 
    error: benefitsError 
  } = useQuery<SubscriptionBenefit[]>({
    queryKey: ["/api/subscription/benefits"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create subscription payment intent
  const subscriptionMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("POST", "/api/purchase-subscription", { planId });
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Returns the featured plan (or first plan if no featured plans)
  const getFeaturedPlan = (): SubscriptionPlan | undefined => {
    if (!plans || plans.length === 0) return undefined;
    
    const featured = plans.find(plan => plan.isFeatured);
    return featured || plans[0];
  };

  // Get a specific plan by ID
  const getPlanById = (id: number): SubscriptionPlan | undefined => {
    if (!plans) return undefined;
    return plans.find(plan => plan.id === id);
  };

  return {
    plans,
    benefits,
    isLoading: plansLoading || benefitsLoading,
    error: plansError || benefitsError,
    subscriptionMutation,
    getFeaturedPlan,
    getPlanById,
  };
}