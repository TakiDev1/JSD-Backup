import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Info } from "lucide-react";

interface ARPreviewProps {
  modId: number;
}

const ARPreview = ({ modId }: ARPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isARSupported, setIsARSupported] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  // Check if WebXR is supported
  useEffect(() => {
    if (!window.navigator.xr) {
      setIsARSupported(false);
      setIsLoading(false);
    } else {
      window.navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        setIsARSupported(supported);
        setIsLoading(false);
      }).catch(() => {
        setIsARSupported(false);
        setIsLoading(false);
      });
    }
  }, []);

  const startAR = async () => {
    setIsStarted(true);
    
    // Simulated AR experience since we can't run actual WebXR in most environments
    if (containerRef.current) {
      // Create a simulated AR view
      const canvas = document.createElement('canvas');
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear container
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Add canvas to container
        containerRef.current.appendChild(canvas);
        
        // Draw simulated AR environment
        const img = new Image();
        img.onload = () => {
          // Draw the background image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Draw a simulated car model in AR
          const carImg = new Image();
          carImg.src = `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80`;
          carImg.onload = () => {
            // Calculate position (centered but slightly toward bottom)
            const x = (canvas.width - carImg.width * 0.6) / 2;
            const y = (canvas.height - carImg.height * 0.6) / 1.7;
            
            // Draw the car with some transparency for AR effect
            ctx.globalAlpha = 0.85;
            ctx.drawImage(carImg, x, y, carImg.width * 0.6, carImg.height * 0.6);
            
            // Draw some AR UI elements
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(115, 0, 255, 0.7)';
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
            ctx.lineWidth = 2;
            
            // AR placement indicator
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 + 100, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 + 100, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            // Scale guide
            ctx.beginPath();
            ctx.moveTo(x - 20, y + carImg.height * 0.6 + 10);
            ctx.lineTo(x + carImg.width * 0.6 + 20, y + carImg.height * 0.6 + 10);
            ctx.stroke();
            
            // Stats overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(10, 10, 150, 70);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`Mod ID: ${modId}`, 20, 30);
            ctx.fillText('Scale: 1:24', 20, 50);
            ctx.fillText('Tap to place model', 20, 70);
          };
        };
        
        img.src = 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-lighter">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-neutral-light">Loading AR preview...</span>
      </div>
    );
  }

  if (!isARSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-lighter p-8 text-center">
        <Info className="h-16 w-16 text-neutral mb-4" />
        <h3 className="text-xl font-display font-bold text-white mb-2">AR Preview Not Available</h3>
        <p className="text-neutral-light mb-4">
          Your device or browser doesn't support WebXR Augmented Reality. 
          Try using a compatible device or browser to experience the AR preview.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          <Button variant="outline" onClick={() => window.open("https://immersiveweb.dev/", "_blank")}>
            Learn More About WebXR
          </Button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-lighter">
        <div className="text-center max-w-md p-6">
          <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">AR Preview Mode</h3>
          <p className="text-neutral-light mb-6">
            View this mod in augmented reality to see how it will look in your real environment.
          </p>
          <Button onClick={startAR} className="w-full bg-primary hover:bg-primary-light">
            Launch AR Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* AR content will be inserted here by the startAR function */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button variant="outline" className="bg-dark bg-opacity-50" onClick={() => setIsStarted(false)}>
          Exit AR Mode
        </Button>
      </div>
    </div>
  );
};

export default ARPreview;
