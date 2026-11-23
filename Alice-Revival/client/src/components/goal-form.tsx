import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Goal } from "@shared/schema";

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  targetDate: z.date().optional(),
  category: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (values: GoalFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  { value: "health", label: "Health & Fitness" },
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal Growth" },
  { value: "financial", label: "Financial" },
  { value: "learning", label: "Learning" },
];

export function GoalForm({ goal, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
      category: goal?.category || undefined,
      progress: goal?.progress || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="What do you want to achieve?"
                  {...field}
                  data-testid="input-goal-title"
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your goal in more detail..."
                  className="resize-none"
                  {...field}
                  data-testid="input-goal-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-goal-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
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
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        data-testid="button-goal-target-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {goal && (
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress: {field.value}%</FormLabel>
                <FormControl>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-goal-progress"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-goal-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-goal-submit">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {goal ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
