import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">
          Customize your UnifyPost experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how UnifyPost looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                data-testid="button-theme-light"
              >
                <Sun className="h-4 w-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                data-testid="button-theme-dark"
              >
                <Moon className="h-4 w-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Post Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your posts are published
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-post-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Schedule Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders for scheduled posts
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-schedule-reminders" />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Failed Post Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts when a post fails to publish
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-failed-alerts" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure platform API credentials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              To enable full posting functionality, you'll need to configure API credentials for each platform.
              These credentials are stored securely and used to authenticate with each social media platform.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-api">Twitter/X API Key</Label>
              <Input
                id="twitter-api"
                type="password"
                placeholder="Enter your Twitter API key"
                data-testid="input-twitter-api"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-token">Facebook Access Token</Label>
              <Input
                id="facebook-token"
                type="password"
                placeholder="Enter your Facebook access token"
                data-testid="input-facebook-token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin-token">LinkedIn Access Token</Label>
              <Input
                id="linkedin-token"
                type="password"
                placeholder="Enter your LinkedIn access token"
                data-testid="input-linkedin-token"
              />
            </div>
          </div>
          <Button variant="outline" disabled data-testid="button-save-api-keys">
            Save API Keys
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About UnifyPost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium">Version</p>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            UnifyPost is a unified social media posting platform that allows you to manage
            all your social media accounts from one place. Write once, post everywhere.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
