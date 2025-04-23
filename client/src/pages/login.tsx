import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { loginWithDiscord } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SiDiscord } from "react-icons/si";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const [location, navigate] = useLocation();
  const { user, isLoading, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discordAuthAvailable, setDiscordAuthAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if Discord auth is available
  useEffect(() => {
    async function checkDiscordAuth() {
      try {
        const response = await fetch("/api/auth/discord-status");
        const data = await response.json();
        setDiscordAuthAvailable(data.available);
      } catch (error) {
        console.error("Error checking Discord auth status:", error);
        setDiscordAuthAvailable(false);
      }
    }
    
    checkDiscordAuth();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { username, password } = values;
      // TODO: Implement regular user login when needed
      // For now, just show toast about unavailable feature
      toast({
        title: "Feature not available",
        description: "Regular login is not yet implemented. Please use Discord login.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Discord login click
  const handleDiscordLogin = async () => {
    try {
      await loginWithDiscord();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Discord login failed. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Choose your preferred login method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 py-6" 
            onClick={handleDiscordLogin}
            disabled={discordAuthAvailable === false}
          >
            <SiDiscord className="h-5 w-5 text-[#5865F2]" />
            <span>{discordAuthAvailable === false ? "Discord Login Unavailable" : "Login with Discord"}</span>
          </Button>
          
          {discordAuthAvailable === false && (
            <>
              <Separator className="my-4" />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center w-full">
            Don't have an account? Please use Discord login to register automatically.
          </div>
          
          <Button variant="link" onClick={() => navigate("/admin-login")} className="w-full">
            Admin Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}