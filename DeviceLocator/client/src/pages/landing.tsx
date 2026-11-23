import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Lock, MapPin, Bell, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-foreground sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Secure Your</span>{' '}
                  <span className="block text-primary xl:inline">Digital Life</span>
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Professional device security and tracking platform. Monitor, protect, and recover your devices with advanced security features and real-time tracking capabilities.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      size="lg" 
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                      onClick={() => window.location.href = '/api/login'}
                      data-testid="button-login"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Secure My Devices
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-primary/20 to-accent/20 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <Shield className="w-32 h-32 text-primary/60" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-foreground sm:text-4xl">
              Comprehensive Device Protection
            </p>
            <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto">
              Advanced security features to keep your devices safe and help you recover them if lost or stolen.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Smartphone className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Device Registration</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Register and manage all your devices in one secure dashboard. Track smartphones, tablets, laptops, and more.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Real-time Tracking</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Monitor device locations in real-time with GPS tracking and location history for comprehensive oversight.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Lock className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Emergency Actions</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Lock, wipe, or sound alarms on lost devices. Take immediate action to protect your data and privacy.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Theft Alerts</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Instant notifications when unusual activity is detected. Get alerts via SMS and email for immediate response.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Activity Monitoring</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Comprehensive activity logs and security reports to keep track of all device interactions and status changes.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Recovery Assistance</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Professional recovery assistance and coordination with law enforcement for stolen device recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            <span className="block">Ready to secure your devices?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-foreground/90">
            Join thousands of users who trust SecureTrack to protect their digital assets.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="mt-8"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-cta-login"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
