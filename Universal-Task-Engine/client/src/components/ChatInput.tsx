import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Zap, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const quickPrompts = [
  { icon: Target, text: "Break down a complex task", prompt: "Help me break down a complex task into manageable steps. The task I need help with is:" },
  { icon: Zap, text: "Solve a problem", prompt: "I need help solving a problem. Here's what I'm facing:" },
  { icon: Lightbulb, text: "Generate ideas", prompt: "I need creative ideas for:" },
  { icon: Sparkles, text: "Explain a concept", prompt: "Please explain in simple terms:" },
];

export function ChatInput({ onSend, disabled, placeholder = "Ask Nexus anything..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt + " ");
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {!message && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => handleQuickPrompt(item.prompt)}
                disabled={disabled}
                data-testid={`button-quick-prompt-${index}`}
              >
                <item.icon className="w-3 h-3" />
                {item.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end gap-2 bg-card border border-card-border rounded-lg p-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm"
            rows={1}
            data-testid="input-message"
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            size="icon"
            className="flex-shrink-0"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Nexus AI uses advanced language models to assist with your tasks
        </p>
      </div>
    </div>
  );
}
