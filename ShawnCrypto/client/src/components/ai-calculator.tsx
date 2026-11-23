import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectionResult {
  projectedValue: string;
  returnPercentage: string;
  confidenceLevel: number;
  analysis: string;
}

export default function AiCalculator() {
  const [amount, setAmount] = useState("1000");
  const [timeHorizon, setTimeHorizon] = useState("30");
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (data: { amount: number; timeHorizon: number }) => {
      const response = await apiRequest("POST", "/api/ai-calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.projection);
      } else {
        toast({
          title: "Calculation Failed",
          description: data.error || "Unable to calculate projection",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate AI projection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    const investmentAmount = parseFloat(amount);
    const horizon = parseInt(timeHorizon);
    
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate({
      amount: investmentAmount,
      timeHorizon: horizon,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-gray-300 mb-2 block">
            Investment Amount (USD)
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className="bg-crypto-darker border-gray-600 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="timeHorizon" className="text-sm font-medium text-gray-300 mb-2 block">
            Time Horizon
          </Label>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="bg-crypto-darker border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">3 Months</SelectItem>
              <SelectItem value="180">6 Months</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleCalculate}
          disabled={calculateMutation.isPending}
          className="w-full bg-gradient-to-r from-crypto-blue to-crypto-purple hover:scale-105 transition-transform"
        >
          <Calculator className="mr-2" />
          {calculateMutation.isPending ? "Calculating..." : "Calculate AI Projection"}
        </Button>
      </div>
      
      <div className="bg-crypto-darker rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">AI Projection Results</h4>
        {result ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Projected Value:</span>
              <span className="text-crypto-success font-bold">${result.projectedValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expected Return:</span>
              <span className="text-crypto-success font-bold">+{result.returnPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence Level:</span>
              <span className="text-crypto-blue font-bold">{result.confidenceLevel}%</span>
            </div>
            <div className="mt-6 p-4 bg-crypto-card rounded-lg">
              <p className="text-sm text-gray-300">
                <Lightbulb className="inline mr-2 text-yellow-400" size={16} />
                AI Analysis: {result.analysis}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Projected Value:</span>
              <span className="text-crypto-success font-bold">$1,247.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expected Return:</span>
              <span className="text-crypto-success font-bold">+24.7%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence Level:</span>
              <span className="text-crypto-blue font-bold">87%</span>
            </div>
            <div className="mt-6 p-4 bg-crypto-card rounded-lg">
              <p className="text-sm text-gray-300">
                <Lightbulb className="inline mr-2 text-yellow-400" size={16} />
                AI Analysis: Click calculate to get personalized projection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
