import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "./file-upload";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      categoryId: product?.categoryId || "",
      isActive: product?.isActive ?? true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Add product data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add product files
      productFiles.forEach(file => {
        formData.append('productFiles', file);
      });

      // Add preview image
      if (previewImage) {
        formData.append('previewImage', previewImage);
      }

      if (product) {
        return await apiRequest("PUT", `/api/products/${product.id}`, formData);
      } else {
        return await apiRequest("POST", "/api/products", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: product ? "Product updated successfully" : "Product created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: product ? "Failed to update product" : "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (!product && productFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one product file",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product name" 
                      {...field} 
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      className="pl-8"
                      {...field} 
                      data-testid="input-price"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  rows={4} 
                  placeholder="Describe your product..." 
                  {...field} 
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Product Files Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Product Files
          </label>
          <FileUpload
            multiple
            accept=".zip,.pdf,.docx,.mp3,.mp4,.psd,.ai,.sketch,.fig"
            onFilesChange={setProductFiles}
            files={productFiles}
            placeholder="Drop product files here or click to upload"
            description="Support for ZIP, PDF, DOCX, MP3, MP4 and more"
            data-testid="upload-product-files"
          />
        </div>
        
        {/* Preview Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preview Image
          </label>
          <FileUpload
            accept="image/*"
            onFilesChange={(files) => setPreviewImage(files[0] || null)}
            files={previewImage ? [previewImage] : []}
            placeholder="Upload product preview image"
            description="JPG, PNG up to 10MB"
            data-testid="upload-preview-image"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSuccess}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createProductMutation.isPending}
            data-testid="button-save-product"
          >
            {createProductMutation.isPending ? "Saving..." : (product ? "Update Product" : "Create Product")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
