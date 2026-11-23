import { cn } from "@/lib/utils";

interface AliceAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export function AliceAvatar({ size = "md", className, animated = false }: AliceAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        animated && "animate-pulse",
        className
      )}
      data-testid="avatar-alice"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          "text-primary-foreground",
          size === "sm" && "w-4 h-4",
          size === "md" && "w-5 h-5",
          size === "lg" && "w-8 h-8"
        )}
      >
        <path
          d="M12 2L14.5 9.5H22L16 14L18.5 22L12 17L5.5 22L8 14L2 9.5H9.5L12 2Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  );
}
