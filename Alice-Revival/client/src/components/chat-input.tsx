import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  voiceEnabled?: boolean;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Message Alice...",
  onVoiceToggle,
  isListening = false,
  voiceEnabled = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
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

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-4" data-testid="chat-input-container">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                "min-h-[44px] max-h-[150px] resize-none pr-12",
                "focus-visible:ring-1 focus-visible:ring-ring"
              )}
              rows={1}
              data-testid="input-chat-message"
            />
          </div>
          {voiceEnabled && onVoiceToggle && (
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={onVoiceToggle}
              disabled={disabled}
              className={cn(isListening && "animate-pulse")}
              data-testid="button-voice-toggle"
            >
              {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            size="icon"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
