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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity, Save, RefreshCw, Settings, Lock, CloudOff, ShieldAlert, Database, 
  Share2, Brush, BrushIcon, Globe, FileWarning, Webhook, CreditCard, ShoppingCart
} from "lucide-react";
import jsdLogo from "@/assets/jsd_logo.png";

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  contactEmail: z.string().email("Must be a valid email address"),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});

const integrationSettingsSchema = z.object({
  patreonClientId: z.string().min(1, "Patreon Client ID is required"),
  patreonClientSecret: z.string().min(1, "Patreon Client Secret is required"),
  patreonWebhookSecret: z.string().optional(),
  patreonCreatorAccessToken: z.string().min(1, "Patreon Creator Access Token is required"),
  discordWebhookUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
});

const paymentSettingsSchema = z.object({
  currency: z.string().min(1, "Currency code is required"),
  defaultSubscriptionPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Must be a valid number ≥ 0",
  }),
  enableStripe: z.boolean().default(true),
  enableSubscriptions: z.boolean().default(true),
  taxRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "Tax rate must be between 0 and 100",
  }),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type IntegrationSettingsValues = z.infer<typeof integrationSettingsSchema>;
type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;

const AdminSettings = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  // Get general settings - only fetch if user is authenticated and admin
  const { data: generalSettings = {
    siteName: "JSD Mods",
    siteDescription: "Premium BeamNG Drive mods",
    contactEmail: "contact@jsdmods.com",
    maintenanceMode: false,
    maintenanceMessage: "Site is currently undergoing maintenance. Please check back soon.",
  }, isLoading: generalSettingsLoading } = useQuery({
    queryKey: ['/api/admin/settings/general'],
    queryFn: async () => {
      return {};
    },
    enabled: !!user && isAdmin,
  });
  
  // Get integration settings - only fetch if user is authenticated and admin
  const { data: integrationSettings = {
    patreonClientId: "",
    patreonClientSecret: "",
    patreonWebhookSecret: "",
    patreonCreatorAccessToken: "",
    discordWebhookUrl: "",
  }, isLoading: integrationSettingsLoading } = useQuery({
    queryKey: ['/api/admin/settings/integrations'],
    queryFn: async () => {
      return {};
    },
    enabled: !!user && isAdmin,
  });
  
  // Get payment settings - only fetch if user is authenticated and admin
  const { data: paymentSettings = {
    currency: "USD",
    defaultSubscriptionPrice: "9.99",
    enableStripe: true,
    enableSubscriptions: true,
    taxRate: "0",
  }, isLoading: paymentSettingsLoading } = useQuery({
    queryKey: ['/api/admin/settings/payments'],
    queryFn: async () => {
      return {};
    },
    enabled: !!user && isAdmin,
  });
  
  // General settings form
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: generalSettings.siteName,
      siteDescription: generalSettings.siteDescription,
      contactEmail: generalSettings.contactEmail,
      maintenanceMode: generalSettings.maintenanceMode,
      maintenanceMessage: generalSettings.maintenanceMessage,
    },
  });
  
  // Integration settings form
  const integrationForm = useForm<IntegrationSettingsValues>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      patreonClientId: integrationSettings.patreonClientId,
      patreonClientSecret: integrationSettings.patreonClientSecret,
      patreonWebhookSecret: integrationSettings.patreonWebhookSecret,
      patreonCreatorAccessToken: integrationSettings.patreonCreatorAccessToken,
      discordWebhookUrl: integrationSettings.discordWebhookUrl,
    },
  });
  
  // Payment settings form
  const paymentForm = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      currency: paymentSettings.currency,
      defaultSubscriptionPrice: paymentSettings.defaultSubscriptionPrice,
      enableStripe: paymentSettings.enableStripe,
      enableSubscriptions: paymentSettings.enableSubscriptions,
      taxRate: paymentSettings.taxRate,
    },
  });
  
  // Update general settings mutation
  const { mutate: updateGeneralSettings, isPending: isUpdatingGeneral } = useMutation({
    mutationFn: async (values: GeneralSettingsValues) => {
      return apiRequest("POST", "/api/admin/settings/general", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/general'] });
      toast({
        title: "Settings Updated",
        description: "General settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update general settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update integration settings mutation
  const { mutate: updateIntegrationSettings, isPending: isUpdatingIntegration } = useMutation({
    mutationFn: async (values: IntegrationSettingsValues) => {
      return apiRequest("POST", "/api/admin/settings/integrations", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/integrations'] });
      toast({
        title: "Settings Updated",
        description: "Integration settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update integration settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update payment settings mutation
  const { mutate: updatePaymentSettings, isPending: isUpdatingPayment } = useMutation({
    mutationFn: async (values: PaymentSettingsValues) => {
      const formattedValues = {
        ...values,
        defaultSubscriptionPrice: parseFloat(values.defaultSubscriptionPrice),
        taxRate: parseFloat(values.taxRate),
      };
      return apiRequest("POST", "/api/admin/settings/payments", formattedValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/payments'] });
      toast({
        title: "Settings Updated",
        description: "Payment settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update payment settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Test connection mutations
  const { mutate: testPatreonConnection, isPending: isTestingPatreon } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/test-patreon", {});
    },
    onSuccess: () => {
      toast({
        title: "Patreon Connection Successful",
        description: "Your Patreon integration is working correctly",
      });
    },
    onError: (error) => {
      toast({
        title: "Patreon Connection Failed",
        description: "Could not connect to Patreon. Please check your integration settings.",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: testDiscordWebhook, isPending: isTestingDiscord } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/test-discord-webhook", {});
    },
    onSuccess: () => {
      toast({
        title: "Discord Webhook Test Successful",
        description: "A test message was sent to your Discord channel",
      });
    },
    onError: (error) => {
      toast({
        title: "Discord Webhook Test Failed",
        description: "Could not send test message to Discord. Please check your webhook URL.",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: testStripeConnection, isPending: isTestingStripe } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/test-stripe", {});
    },
    onSuccess: () => {
      toast({
        title: "Stripe Connection Successful",
        description: "Your Stripe integration is working correctly",
      });
    },
    onError: (error) => {
      toast({
        title: "Stripe Connection Failed",
        description: "Could not connect to Stripe. Please check your API keys.",
        variant: "destructive",
      });
    },
  });
  
  // Form submit handlers
  const onSubmitGeneral = (values: GeneralSettingsValues) => {
    updateGeneralSettings(values);
  };
  
  const onSubmitIntegration = (values: IntegrationSettingsValues) => {
    updateIntegrationSettings(values);
  };
  
  const onSubmitPayment = (values: PaymentSettingsValues) => {
    updatePaymentSettings(values);
  };
  
  // Update form values when data changes
  useState(() => {
    if (!generalSettingsLoading) {
      generalForm.reset({
        siteName: generalSettings.siteName,
        siteDescription: generalSettings.siteDescription,
        contactEmail: generalSettings.contactEmail,
        maintenanceMode: generalSettings.maintenanceMode,
        maintenanceMessage: generalSettings.maintenanceMessage,
      });
    }
    
    if (!integrationSettingsLoading) {
      integrationForm.reset({
        patreonClientId: integrationSettings.patreonClientId,
        patreonClientSecret: integrationSettings.patreonClientSecret,
        patreonWebhookSecret: integrationSettings.patreonWebhookSecret,
        patreonCreatorAccessToken: integrationSettings.patreonCreatorAccessToken,
        discordWebhookUrl: integrationSettings.discordWebhookUrl,
      });
    }
    
    if (!paymentSettingsLoading) {
      paymentForm.reset({
        currency: paymentSettings.currency,
        defaultSubscriptionPrice: paymentSettings.defaultSubscriptionPrice.toString(),
        enableStripe: paymentSettings.enableStripe,
        enableSubscriptions: paymentSettings.enableSubscriptions,
        taxRate: paymentSettings.taxRate.toString(),
      });
    }
  });
  
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
            <h1 className="text-3xl font-bold text-white">Site Settings</h1>
            <p className="text-neutral-light">Configure your site's settings and integrations</p>
          </div>
        </div>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full grid grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> General Settings
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Integration Settings
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="bg-dark-card border-dark-lighter/50">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
                <CardDescription>Manage general site configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="JSD Mods" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Premium BeamNG Drive mods..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Alert className="bg-dark-lighter">
                          <AlertTitle className="text-white">Maintenance Mode</AlertTitle>
                          <AlertDescription>
                            When enabled, only administrators will be able to access the site. Use this when performing major updates.
                          </AlertDescription>
                        </Alert>
                      </div>
                      
                      <FormField
                        control={generalForm.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                            <div>
                              <FormLabel className="text-base flex items-center gap-2">
                                <CloudOff className="h-4 w-4" /> Maintenance Mode
                              </FormLabel>
                              <FormDescription>
                                Put the site in maintenance mode
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
                        control={generalForm.control}
                        name="maintenanceMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maintenance Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Site is down for maintenance..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-light"
                        disabled={isUpdatingGeneral}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdatingGeneral ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card className="bg-dark-card border-dark-lighter/50">
              <CardHeader>
                <CardTitle className="text-white">Integration Settings</CardTitle>
                <CardDescription>Configure third-party service integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...integrationForm}>
                  <form onSubmit={integrationForm.handleSubmit(onSubmitIntegration)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <img src="https://c5.patreon.com/external/logo/downloads_logomark_color_on_white@2x.png" 
                          alt="Patreon Logo" className="h-8 w-8 rounded bg-white p-1" />
                        <h3 className="text-xl font-semibold text-white">Patreon Integration</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={integrationForm.control}
                          name="patreonClientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patreon Client ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Client ID..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={integrationForm.control}
                          name="patreonClientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patreon Client Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Client Secret..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={integrationForm.control}
                          name="patreonCreatorAccessToken"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Patreon Creator Access Token</FormLabel>
                              <FormControl>
                                <Input placeholder="Creator Access Token..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={integrationForm.control}
                          name="patreonWebhookSecret"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Patreon Webhook Secret (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Webhook Secret..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={isTestingPatreon}
                          onClick={() => testPatreonConnection()}
                          className="mr-2"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          {isTestingPatreon ? "Testing..." : "Test Connection"}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.png" 
                          alt="Discord Logo" className="h-8 w-8 rounded bg-white p-1" />
                        <h3 className="text-xl font-semibold text-white">Discord Integration</h3>
                      </div>
                      
                      <FormField
                        control={integrationForm.control}
                        name="discordWebhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord Webhook URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Used to send notifications to your Discord server
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={isTestingDiscord || !integrationForm.getValues("discordWebhookUrl")}
                          onClick={() => testDiscordWebhook()}
                        >
                          <Webhook className="mr-2 h-4 w-4" />
                          {isTestingDiscord ? "Sending..." : "Send Test Message"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-light"
                        disabled={isUpdatingIntegration}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdatingIntegration ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card className="bg-dark-card border-dark-lighter/50">
              <CardHeader>
                <CardTitle className="text-white">Payment Settings</CardTitle>
                <CardDescription>Configure payment and subscription options</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                          alt="Stripe Logo" className="h-8 w-auto bg-white rounded p-1" />
                        <h3 className="text-xl font-semibold text-white">Stripe Configuration</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={paymentForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <FormControl>
                                <Input placeholder="USD" {...field} />
                              </FormControl>
                              <FormDescription>
                                Three-letter ISO currency code (e.g., USD, EUR)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="taxRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.01" placeholder="0" {...field} />
                              </FormControl>
                              <FormDescription>
                                Percentage tax rate to apply to purchases
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="enableStripe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                              <div>
                                <FormLabel className="text-base">Enable Stripe Payments</FormLabel>
                                <FormDescription>
                                  Allow users to purchase mods using Stripe
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
                        
                        <div className="flex justify-start items-center">
                          <Button 
                            type="button" 
                            variant="outline"
                            disabled={isTestingStripe || !paymentForm.getValues("enableStripe")}
                            onClick={() => testStripeConnection()}
                          >
                            <Activity className="mr-2 h-4 w-4" />
                            {isTestingStripe ? "Testing..." : "Test Stripe Connection"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold text-white">Subscription Options</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={paymentForm.control}
                          name="enableSubscriptions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                              <div>
                                <FormLabel className="text-base">Enable Subscriptions</FormLabel>
                                <FormDescription>
                                  Allow users to subscribe for premium access
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
                          control={paymentForm.control}
                          name="defaultSubscriptionPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Subscription Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  placeholder="9.99" 
                                  {...field} 
                                  disabled={!paymentForm.getValues("enableSubscriptions")}
                                />
                              </FormControl>
                              <FormDescription>
                                Monthly subscription price in your selected currency
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-light"
                        disabled={isUpdatingPayment}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdatingPayment ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;