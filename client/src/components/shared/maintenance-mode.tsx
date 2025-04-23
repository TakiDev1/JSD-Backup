
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export function MaintenanceMode() {
  return (
    <div className="fixed inset-0 z-[9999] bg-dark bg-opacity-95 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-lg mx-auto px-4">
        <div className="mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-white">Maintenance Mode</h1>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-lg py-2">
          We'll be back soon!
        </Badge>
        <p className="text-neutral-light text-lg">
          Our site is currently undergoing scheduled maintenance to bring you an even better experience.
        </p>
      </div>
    </div>
  );
}
