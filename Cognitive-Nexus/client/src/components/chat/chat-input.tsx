import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "./voice-recorder";
import { VideoCapture } from "./video-capture";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string, media?: { type: string; data: string }) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<{ type: string; data: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if ((!message.trim() && !attachedMedia) || isLoading) return;
    
    onSendMessage(
      message.trim() || (attachedMedia ? "Please analyze this media." : ""),
      attachedMedia ? { type: attachedMedia.type, data: attachedMedia.data } : undefined
    );
    setMessage("");
    setAttachedMedia(null);
  }, [message, attachedMedia, isLoading, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedMedia({
        type: file.type,
        data: dataUrl,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleVoiceRecording = useCallback((audioBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedMedia({
        type: audioBlob.type,
        data: dataUrl,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(audioBlob);
  }, []);

  const handleVideoCapture = useCallback((mediaBlob: Blob, type: "image" | "video") => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedMedia({
        type: type === "image" ? "image/jpeg" : "video/webm",
        data: dataUrl,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(mediaBlob);
  }, []);

  const removeAttachment = () => {
    setAttachedMedia(null);
  };

  return (
    <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-lg p-4" data-testid="chat-input-container">
      {attachedMedia && (
        <div className="mb-3 flex items-start gap-2">
          <div className="relative inline-block">
            {attachedMedia.type.startsWith("image") && (
              <img 
                src={attachedMedia.preview} 
                alt="Attachment preview" 
                className="h-20 w-auto rounded-lg border border-border"
                data-testid="img-attachment-preview"
              />
            )}
            {attachedMedia.type.startsWith("video") && (
              <video 
                src={attachedMedia.preview}
                className="h-20 w-auto rounded-lg border border-border"
                data-testid="video-attachment-preview"
              />
            )}
            {attachedMedia.type.startsWith("audio") && (
              <audio 
                src={attachedMedia.preview}
                controls
                className="h-10"
                data-testid="audio-attachment-preview"
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={removeAttachment}
              data-testid="button-remove-attachment"
            >
              <span className="text-xs">X</span>
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-upload"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            data-testid="button-attach-file"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <VoiceRecorder onRecordingComplete={handleVoiceRecording} disabled={isLoading} />
          <VideoCapture onCapture={handleVideoCapture} disabled={isLoading} />
        </div>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-32 resize-none flex-1"
          disabled={isLoading}
          data-testid="input-chat-message"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!message.trim() && !attachedMedia)}
          size="icon"
          data-testid="button-send-message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
