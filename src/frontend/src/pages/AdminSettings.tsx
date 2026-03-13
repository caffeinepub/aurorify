import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Package, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function AdminSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (!checkingAdmin && isAdmin === false) navigate({ to: "/" });
  }, [isAdmin, checkingAdmin, navigate]);

  const [secretKey, setSecretKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("US");

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not ready");
      return actor.setStripeConfiguration({
        secretKey,
        allowedCountries: allowedCountries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripeConfigured"] });
      toast.success("Stripe configuration saved");
    },
    onError: () => toast.error("Failed to save Stripe configuration"),
  });

  const seedMutation = useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not ready");
      return actor.seedProducts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["availableProducts"] });
      toast.success("Sample products seeded successfully");
    },
    onError: () => toast.error("Seeding failed"),
  });

  if (checkingAdmin || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link
            to="/admin"
            className="text-background/60 hover:text-background transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display font-semibold">Settings</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Settings className="h-5 w-5" /> Stripe Configuration
              </CardTitle>
              <CardDescription className="font-body">
                Configure Stripe payments for your store. Get your keys from the
                Stripe Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  data-ocid="settings.stripe_key.input"
                  placeholder="sk_live_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="allowedCountries">
                  Allowed Countries (comma-separated)
                </Label>
                <Input
                  id="allowedCountries"
                  data-ocid="settings.countries.input"
                  placeholder="US, CA, GB"
                  value={allowedCountries}
                  onChange={(e) => setAllowedCountries(e.target.value)}
                />
                <p className="text-xs text-muted-foreground font-body">
                  ISO 3166-1 alpha-2 country codes (e.g. US, CA, GB)
                </p>
              </div>
              <Button
                data-ocid="settings.stripe.save.button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !secretKey}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </CardContent>
          </Card>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Package className="h-5 w-5" /> Sample Products
              </CardTitle>
              <CardDescription className="font-body">
                Populate your store with sample home decor products to get
                started quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                data-ocid="settings.seed.button"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Seed Sample Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
