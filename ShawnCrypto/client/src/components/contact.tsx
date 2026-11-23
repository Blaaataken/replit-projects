import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Send, MessageSquare, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertContact } from "@shared/schema";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    interestType: "",
    investmentAmount: "",
    message: "",
  });

  const { toast } = useToast();

  const submitContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your interest! We will contact you soon.",
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          interestType: "",
          investmentAmount: "",
          message: "",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: data.error || "Unable to submit your message",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit contact form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.interestType || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitContactMutation.mutate(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const socialLinks = [
    { name: "Twitter", icon: "fab fa-twitter", color: "hover:bg-blue-600" },
    { name: "LinkedIn", icon: "fab fa-linkedin", color: "hover:bg-blue-800" },
    { name: "YouTube", icon: "fab fa-youtube", color: "hover:bg-red-600" },
    { name: "GitHub", icon: "fab fa-github", color: "hover:bg-purple-600" },
  ];

  const contactInfo = [
    { icon: Mail, title: "Email", value: "contact@shawnsworks.io", color: "from-crypto-blue to-crypto-purple" },
    { icon: MessageSquare, title: "Telegram", value: "@shawnsworks", color: "from-crypto-success to-emerald-400" },
    { icon: Users, title: "Discord", value: "SHAWNSWORKS Community", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <section id="contact" className="py-20 bg-crypto-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the <span className="gradient-text">Revolution</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to be part of the future of universal cryptocurrency? Connect with us today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-300 mb-2 block">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      className="bg-crypto-darker border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-300 mb-2 block">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      className="bg-crypto-darker border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 block">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john@example.com"
                    className="bg-crypto-darker border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="interestType" className="text-sm font-medium text-gray-300 mb-2 block">
                    Interest Type *
                  </Label>
                  <Select value={formData.interestType} onValueChange={(value) => updateFormData('interestType', value)}>
                    <SelectTrigger className="bg-crypto-darker border-gray-600 text-white">
                      <SelectValue placeholder="Select your interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">Investment Opportunity</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="technical">Technical Integration</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="investmentAmount" className="text-sm font-medium text-gray-300 mb-2 block">
                    Investment Amount (Optional)
                  </Label>
                  <Select value={formData.investmentAmount} onValueChange={(value) => updateFormData('investmentAmount', value)}>
                    <SelectTrigger className="bg-crypto-darker border-gray-600 text-white">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1k-10k">$1,000 - $10,000</SelectItem>
                      <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k+">$100,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-300 mb-2 block">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => updateFormData('message', e.target.value)}
                    placeholder="Tell us about your interest in SHAWNSWORKS..."
                    className="bg-crypto-darker border-gray-600 text-white"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={submitContactMutation.isPending}
                  className="w-full bg-gradient-to-r from-crypto-blue to-crypto-purple hover:scale-105 transition-transform"
                >
                  <Send className="mr-2" />
                  {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Community */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="glass-card">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center mr-4`}>
                          <IconComponent className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{info.title}</div>
                          <div className="text-gray-400">{info.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="glass-card">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Join Our Community</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`flex items-center justify-center p-4 bg-crypto-darker rounded-lg ${social.color} transition-colors`}
                    >
                      <i className={`${social.icon} text-2xl mr-3`}></i>
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
                
                <div className="p-4 bg-crypto-darker rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Community Stats</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-crypto-blue">24,567</div>
                        <div className="text-xs text-gray-400">Telegram</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-crypto-purple">18,923</div>
                        <div className="text-xs text-gray-400">Discord</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-crypto-success">45,291</div>
                        <div className="text-xs text-gray-400">Twitter</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
