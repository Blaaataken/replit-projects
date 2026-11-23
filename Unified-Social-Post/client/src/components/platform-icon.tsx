import { SiX, SiFacebook, SiLinkedin, SiInstagram, SiThreads } from "react-icons/si";
import type { SocialPlatform } from "@shared/schema";

interface PlatformIconProps {
  platform: SocialPlatform;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className = "", size = 20 }: PlatformIconProps) {
  const iconProps = { className, size };

  switch (platform) {
    case "twitter":
      return <SiX {...iconProps} />;
    case "facebook":
      return <SiFacebook {...iconProps} />;
    case "linkedin":
      return <SiLinkedin {...iconProps} />;
    case "instagram":
      return <SiInstagram {...iconProps} />;
    case "threads":
      return <SiThreads {...iconProps} />;
    default:
      return null;
  }
}

export function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    twitter: "#000000",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    instagram: "#E4405F",
    threads: "#000000",
  };
  return colors[platform];
}

export function getPlatformName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    twitter: "X (Twitter)",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    threads: "Threads",
  };
  return names[platform];
}
