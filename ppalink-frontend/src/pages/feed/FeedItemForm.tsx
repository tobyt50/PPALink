import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/forms/Input";
import { Textarea } from "../../components/forms/Textarea";
import { Label } from "../../components/ui/Label";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import feedService from "../../services/feed.service";
import type { FeedItem } from "../../types/feed";
import {
  ALL_FEED_CATEGORIES,
  CANDIDATE_FEED_CATEGORIES,
  AGENCY_FEED_CATEGORIES,
  FEED_TYPES,
  FEED_AUDIENCES,
} from "../../utils/constants";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { FileUpload } from "../../components/forms/FileUpload";
import { useAuthStore } from "../../context/AuthContext";

const feedItemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  link: z
    .string()
    .url("Must be a valid URL.")
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  ctaText: z
    .string()
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  imageUrl: z
    .string()
    .url("Must be a valid URL.")
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  category: z.enum(ALL_FEED_CATEGORIES),
  type: z.enum(FEED_TYPES),
  audience: z.enum(FEED_AUDIENCES),
  isActive: z.boolean(),
});

type SchemaInput = z.input<typeof feedItemSchema>;
type SchemaOutput = z.infer<typeof feedItemSchema>;

const FeedItemFormPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!itemId;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const availableCategories = useMemo(() => {
    if (isAdmin) return ALL_FEED_CATEGORIES;
    if (user?.role === "AGENCY") return AGENCY_FEED_CATEGORIES;
    if (user?.role === "CANDIDATE") return CANDIDATE_FEED_CATEGORIES;
    return [];
  }, [user, isAdmin]);

  const { data: initialData, isLoading } = useFetch<FeedItem>(
    isEditMode ? (isAdmin ? `/admin/feed/${itemId}` : `/feed/${itemId}`) : null
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<SchemaInput, unknown, SchemaOutput>({
    resolver: zodResolver(feedItemSchema),
    defaultValues: {
      isActive: true,
      link: "",
      ctaText: "",
      imageUrl: "",
      audience: "ALL",
      type: "ARTICLE",
    },
  });
  const watchedCategory = watch("category");
  const watchedType = watch("type");
  const watchedAudience = watch("audience");

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        ...initialData,
        link: initialData.link ?? "",
        ctaText: initialData.ctaText ?? "",
        imageUrl: initialData.imageUrl ?? "",
      });
    }
  }, [initialData, isEditMode, reset]);

  const onSubmit = async (data: SchemaOutput) => {
    const actionPromise = isEditMode
      ? isAdmin
        ? feedService.adminUpdateFeedItem(itemId!, data)
        : feedService.updateMyPost(itemId!, data)
      : isAdmin
      ? feedService.adminCreateFeedItem(data)
      : feedService.createUniversalPost(data);

    await toast.promise(actionPromise, {
      loading: isEditMode ? "Saving post..." : "Creating post...",
      success: () => {
        const redirectPath = isAdmin
          ? "/feed/manage"
          : "/feed/manage";
        navigate(redirectPath);
        return `Post ${isEditMode ? "updated" : "created"} successfully!`;
      },
      error: (err: any) => err.response?.data?.message || "An error occurred.",
    });
  };

  const handleImageUpload = (fileKey: string) => {
    const imageUrl = `https://${process.env.REACT_APP_S3_BUCKET_NAME}.s3.${process.env.REACT_APP_S3_REGION}.amazonaws.com/${fileKey}`;
    setValue("imageUrl", imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.success("Image uploaded. Remember to save the post.");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          {isEditMode ? "Edit Post" : "New Post"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Share an update, insight, or success story with the community.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input {...register("title")} error={!!errors.title} />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">
                            {watchedCategory || "Select..."}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </DropdownTrigger>
                      }
                    >
                      {availableCategories.map((c) => (
                        <SimpleDropdownItem
                          key={c}
                          onSelect={() => field.onChange(c)}
                        >
                          {c}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Content (Main Text)</Label>
              <Textarea
                rows={5}
                {...register("content")}
                error={!!errors.content}
              />
              {errors.content && (
                <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                  {errors.content.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label>Link (URL)</Label>
                <Input type="url" {...register("link")} error={!!errors.link} />
                {errors.link && (
                  <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                    {errors.link.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>CTA Button Text</Label>
                <Input
                  placeholder="e.g., Learn More"
                  {...register("ctaText")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  type="url"
                  placeholder="Paste an image URL or upload one"
                  {...register("imageUrl")}
                  error={!!errors.imageUrl}
                />
                {errors.imageUrl && (
                  <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>            
              <div>
                <FileUpload
                  label="Or Upload an Image"
                  uploadType="cv"
                  onUploadSuccess={handleImageUpload}
                />
              </div>
            {isAdmin && (
              <div className="border-t pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">
                                {watchedType || "Select..."}
                              </span>
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </DropdownTrigger>
                          }
                        >
                          {FEED_TYPES.map((t) => (
                            <SimpleDropdownItem
                              key={t}
                              onSelect={() => field.onChange(t)}
                            >
                              {t}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                    {errors.type && (
                      <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Audience</Label>
                    <Controller
                      name="audience"
                      control={control}
                      render={({ field }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">
                                {watchedAudience || "Select..."}
                              </span>
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </DropdownTrigger>
                          }
                        >
                          {FEED_AUDIENCES.map((a) => (
                            <SimpleDropdownItem
                              key={a}
                              onSelect={() => field.onChange(a)}
                            >
                              {a}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                    {errors.audience && (
                      <p className="text-xs text-red-500 mt-1 dark:text-red-400">
                        {errors.audience.message}
                      </p>
                    )}
                  </div>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between p-4 border dark:border-zinc-800 rounded-xl">
                      <div>
                        <Label>Post Status</Label>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          Inactive posts will not appear in any feed.
                        </p>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <ToggleSwitch
                          enabled={field.value}
                          onChange={field.onChange}
                          srLabel="Toggle post status"
                        />
                        <span
                          className={`text-sm font-semibold ${
                            field.value
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500 dark:text-zinc-400"
                          }`}
                        >
                          {field.value ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
          <div className="p-5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeedItemFormPage;
