import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Upload, ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { adminSignOut } from "@/hooks/useAdminAuth";
import SEOHead from "@/components/SEOHead";
import {
  processProductImage,
  variantPath,
  VARIANT_WIDTHS,
} from "@/lib/imageProcessing";

const BUCKET = "product-images";

interface ProductRow {
  id: string;
  name: string;
  images: string[] | null;
}

const AdminImages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, images")
        .eq("is_active", true)
        .single();
      if (error) {
        toast({ title: "Could not load the product", description: error.message, variant: "destructive" });
      } else {
        setProduct(data as ProductRow);
      }
      setLoading(false);
    })();
  }, [toast]);

  const images = product?.images ?? [];

  const saveImages = async (next: string[]) => {
    if (!product) return;
    const { error } = await supabase.from("products").update({ images: next }).eq("id", product.id);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setProduct({ ...product, images: next });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !product) return;
    for (const file of Array.from(files)) {
      try {
        setBusy(`Preparing ${file.name}...`);
        // Cropped square + one file per width, so the same upload looks right
        // in the desktop grid and full-bleed on a phone.
        const variants = await processProductImage(file);

        const uploadedByWidth: Array<{ width: number; url: string }> = [];
        for (const variant of variants) {
          setBusy(`Uploading ${file.name} at ${variant.width}px...`);
          const path = variantPath(product.id, file.name, variant.width);
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, variant.blob, { contentType: "image/webp", upsert: true });
          if (error) throw error;
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          uploadedByWidth.push({ width: variant.width, url: data.publicUrl });
        }

        // The largest variant is the canonical URL stored on the product; the
        // smaller ones sit beside it in the bucket for srcset to pick up.
        const largest = uploadedByWidth.sort((a, b) => b.width - a.width)[0];
        await saveImages([...(product.images ?? []), largest.url]);
        toast({ title: `Added ${file.name}`, description: `${variants.length} sizes uploaded.` });
      } catch (err) {
        console.error("Image upload failed:", err);
        toast({
          title: `Could not add ${file.name}`,
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
    setBusy("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const removeImage = async (url: string) => {
    if (!product) return;
    setBusy("Removing...");
    // Remove every stored width, not just the one referenced on the product.
    const base = url.split("/").pop()?.replace(/-\d+\.webp$/, "") ?? "";
    const paths = VARIANT_WIDTHS.map((w) => `products/${product.id}/${base}-${w}.webp`);
    await supabase.storage.from(BUCKET).remove(paths);
    await saveImages(images.filter((i) => i !== url));
    setBusy("");
  };

  const makePrimary = async (url: string) => {
    await saveImages([url, ...images.filter((i) => i !== url)]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <SEOHead title="Product Images | Pure Ihram" description="Admin product images." noindex />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Orders
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Product images</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await adminSignOut(); navigate("/admin"); }}>
            Sign out
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Add photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pick any photo from your phone or camera. Each one is cropped to a square from
              the centre and saved at {VARIANT_WIDTHS.join(", ")} pixels wide as WebP, so the
              shop can serve a small file on mobile and a sharp one on desktop.
              Shoot roughly square and keep the product centred.
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={!!busy}
              onChange={(e) => handleFiles(e.target.files)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
            />
            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {busy}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Current images ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uploaded images yet. The shop is showing its built-in photos.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((url, idx) => (
                  <div key={url} className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          Main
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {idx !== 0 && (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => makePrimary(url)} disabled={!!busy}>
                          <Star className="h-3 w-3 mr-1" /> Main
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => removeImage(url)} disabled={!!busy}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImages;
