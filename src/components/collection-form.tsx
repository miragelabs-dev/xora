import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const collectionSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be less than 255 characters"),
  symbol: z.string()
    .min(2, "Symbol must be at least 2 characters")
    .max(10, "Symbol must be less than 10 characters")
    .regex(/^[A-Z]+$/, "Symbol must be uppercase letters only"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .nullable()
    .transform(val => val || null),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  defaultValues?: CollectionFormValues;
  onSubmit: (data: CollectionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function CollectionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CollectionFormProps) {
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      symbol: defaultValues?.symbol ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Collection name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input
                  placeholder="SYMBOL"
                  {...field}
                  value={field.value.toUpperCase()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Collection description"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
} 