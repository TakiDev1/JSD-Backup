import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function DiscordCallbackHandler() {
  const [location, navigate] = useLocation();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleDiscordCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const discordSuccess = urlParams.get('discord_success');
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error === 'discord_failed') {
        toast({
          title: "Discord Login Failed",
          description: "There was an issue with Discord authentication. Please try again.",
          variant: "destructive",
        });
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (discordSuccess === 'true' && token) {
        console.log('Discord authentication successful, storing token...');
        
        // Store the token in localStorage
        localStorage.setItem('jsd_auth_token', token);
        
        // Refresh the authentication state
        await refreshUser();
        
        // Show success message
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in with Discord.",
        });
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('Discord authentication flow completed');
      }
    };

    handleDiscordCallback();
  }, [refreshUser, toast]);

  return null; // This is an invisible component
}

export default DiscordCallbackHandler;