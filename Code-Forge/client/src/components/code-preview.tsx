import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CodePreviewProps {
  code: string;
  language?: string;
  fileName?: string;
}

export function CodePreview({ code, language = "typescript", fileName }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-chart-4/50" />
            <div className="w-3 h-3 rounded-full bg-chart-2/50" />
          </div>
          {fileName && (
            <span className="font-mono text-sm text-muted-foreground ml-2">
              {fileName}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          data-testid="button-copy-code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-chart-2" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}
