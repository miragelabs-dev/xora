'use client';

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
import { ImageSelect } from "./image-select";

const communitySchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters"),
  cover: z.union([
    z.string().url("Cover must be a valid URL"),
    z.literal(""),
  ]),
  description: z.union([
    z.string().max(1000, "Description must be less than 1000 characters"),
    z.literal(""),
  ]),
});

export type CommunityFormValues = z.infer<typeof communitySchema>;

export type CommunityFormSubmitValues = {
  title: string;
  cover: string | null;
  description: string | null;
};

interface CommunityFormProps {
  defaultValues?: {
    title?: string;
    cover?: string | null;
    description?: string | null;
  };
  onSubmit: (data: CommunityFormSubmitValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function CommunityForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CommunityFormProps) {
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      cover: defaultValues?.cover ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const handleSubmit = (values: CommunityFormValues) => {
    onSubmit({
      title: values.title.trim(),
      cover: values.cover.trim() === "" ? null : values.cover.trim(),
      description: values.description.trim() === "" ? null : values.description.trim(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Community title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <ImageSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                  previewProps={{
                    aspectRatioClassName: "aspect-[3/1]",
                  }}
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
                  placeholder="Describe the community"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {(isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
