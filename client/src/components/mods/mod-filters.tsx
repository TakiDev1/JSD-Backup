import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { MOD_CATEGORIES } from "@/lib/constants";

interface ModFiltersProps {
  categories: { id: string; name: string; count: number }[];
  selectedCategory?: string | null;
  featured?: boolean | null;
  subscription?: boolean | null;
  onApplyFilters: (
    category?: string,
    featured?: boolean,
    subscription?: boolean
  ) => void;
  className?: string;
}

const ModFilters = ({
  categories,
  selectedCategory,
  featured,
  subscription,
  onApplyFilters,
  className,
}: ModFiltersProps) => {
  const [category, setCategory] = useState<string | undefined>(
    selectedCategory || undefined
  );
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(
    featured || undefined
  );
  const [isSubscription, setIsSubscription] = useState<boolean | undefined>(
    subscription || undefined
  );

  const handleCategoryChange = (id: string) => {
    setCategory(category === id ? undefined : id);
  };

  const handleApplyFilters = () => {
    onApplyFilters(category, isFeatured, isSubscription);
  };

  const handleClearFilters = () => {
    setCategory(undefined);
    setIsFeatured(undefined);
    setIsSubscription(undefined);
    onApplyFilters(undefined, undefined, undefined);
  };

  return (
    <div className={className}>
      <Card className="bg-dark-card border-dark-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-display flex items-center">
            <Filter className="h-5 w-5 mr-2" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-display text-white mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${cat.id}`}
                    checked={category === cat.id}
                    onCheckedChange={() => handleCategoryChange(cat.id)}
                  />
                  <Label
                    htmlFor={`category-${cat.id}`}
                    className="text-neutral-light cursor-pointer flex-1"
                  >
                    {cat.name}
                  </Label>
                  <span className="text-sm text-neutral">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-display text-white mb-2">Options</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) =>
                    setIsFeatured(checked === true ? true : undefined)
                  }
                />
                <Label
                  htmlFor="featured"
                  className="text-neutral-light cursor-pointer"
                >
                  Featured Mods
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscription"
                  checked={isSubscription}
                  onCheckedChange={(checked) =>
                    setIsSubscription(checked === true ? true : undefined)
                  }
                />
                <Label
                  htmlFor="subscription"
                  className="text-neutral-light cursor-pointer"
                >
                  Subscription Only
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              className="w-full bg-primary hover:bg-primary-light"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModFilters;
