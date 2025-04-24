import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import JSDLogo from "@assets/JSD_pfp_Transparent.png";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto text-center">
        <img 
          src={JSDLogo} 
          alt="JSD Logo" 
          className="w-24 h-24 mx-auto mb-6"
        />
        
        <h1 className="text-3xl font-bold text-primary mb-4">
          Maintenance in Progress
        </h1>
        
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border mb-8">
          <div className="text-purple-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          
          <p className="text-lg mb-4">
            Discord authentication is currently unavailable while we make improvements to our service.
          </p>
          
          <p className="text-muted-foreground mb-6">
            Please check back later or use our standard login method to access your account.
          </p>
        </div>
        
        <Button asChild>
          <Link to="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MaintenancePage;