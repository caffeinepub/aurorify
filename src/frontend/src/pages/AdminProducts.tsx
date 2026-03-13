import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend.d";
import type { Product } from "../backend.d";
import { useActor } from "../hooks/useActor";

const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  description: "",
  imageUrl: "",
  price: 0n,
  category: Category.livingRoom,
  isAvailable: true,
});

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

export default function AdminProducts() {
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

  const { data: products, isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => actor!.listProducts(),
    enabled: !!actor && !isFetching && !!isAdmin,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct());
  const [priceInput, setPriceInput] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyProduct());
    setPriceInput("");
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setPriceInput((Number(product.price) / 100).toFixed(2));
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not ready");
      const priceCents = BigInt(
        Math.round(Number.parseFloat(priceInput) * 100),
      );
      const data = { ...formData, price: priceCents };
      if (editingProduct) {
        await actor.updateProduct({ ...data, id: editingProduct.id });
      } else {
        const id = crypto.randomUUID();
        await actor.createProduct({ ...data, id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["availableProducts"] });
      setDialogOpen(false);
      toast.success(editingProduct ? "Product updated" : "Product created");
    },
    onError: () => toast.error("Failed to save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("Not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["availableProducts"] });
      setDeleteConfirmId(null);
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const seedMutation = useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not ready");
      return actor.seedProducts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["availableProducts"] });
      toast.success("Products seeded");
    },
    onError: () => toast.error("Seeding failed"),
  });

  if (checkingAdmin || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-background/60 hover:text-background transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="font-display font-semibold">Products</h1>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              data-ocid="admin.seed.button"
              className="border-background/30 text-background bg-transparent hover:bg-background/10"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              Seed Products
            </Button>
            <Button
              size="sm"
              data-ocid="admin.add_product.button"
              className="border-background/30 text-foreground"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div
            data-ocid="admin.products.loading_state"
            className="text-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (products?.length ?? 0) === 0 ? (
          <div
            data-ocid="admin.products.empty_state"
            className="text-center py-20"
          >
            <p className="font-display text-xl text-muted-foreground">
              No products yet
            </p>
            <Button
              className="mt-4"
              onClick={openCreate}
              data-ocid="admin.create_first.button"
            >
              Create First Product
            </Button>
          </div>
        ) : (
          <div
            data-ocid="admin.products.table"
            className="rounded-lg border border-border overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product, i) => (
                  <TableRow
                    key={product.id}
                    data-ocid={`admin.product.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-body font-medium text-sm line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground capitalize">
                      {product.category}
                    </TableCell>
                    <TableCell className="font-body font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.isAvailable ? "Available" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-ocid={`admin.product.edit_button.${i + 1}`}
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-ocid={`admin.product.delete_button.${i + 1}`}
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.product.dialog"
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                data-ocid="admin.product.name.input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Product name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                data-ocid="admin.product.description.textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                data-ocid="admin.product.image.input"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (USD)</Label>
                <Input
                  data-ocid="admin.product.price.input"
                  type="number"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v as Category })
                  }
                >
                  <SelectTrigger data-ocid="admin.product.category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livingRoom">Living Room</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="admin.product.available.switch"
                checked={formData.isAvailable}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, isAvailable: v })
                }
              />
              <Label>Available in shop</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="admin.product.cancel.button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.product.save.button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !formData.name || !priceInput}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="admin.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="font-body text-muted-foreground text-sm">
            This action cannot be undone. The product will be permanently
            removed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="admin.delete.cancel.button"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="admin.delete.confirm.button"
              onClick={() =>
                deleteConfirmId && deleteMutation.mutate(deleteConfirmId)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
