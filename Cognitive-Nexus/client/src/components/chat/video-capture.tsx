import { useState, useRef, useCallback } from "react";
import { Video, Camera, X, Check, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoCaptureProps {
  onCapture: (mediaBlob: Blob, type: "image" | "video") => void;
  disabled?: boolean;
}

export function VideoCapture({ onCapture, disabled }: VideoCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob; type: "image" | "video"; url: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    await startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedMedia(null);
    setIsRecording(false);
    setIsOpen(false);
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedMedia({
          blob,
          type: "image",
          url: URL.createObjectURL(blob),
        });
      }
    }, "image/jpeg", 0.9);
  }, []);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
      setCapturedMedia({
        blob: videoBlob,
        type: "video",
        url: URL.createObjectURL(videoBlob),
      });
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, []);

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleRetake = useCallback(() => {
    if (capturedMedia?.url) {
      URL.revokeObjectURL(capturedMedia.url);
    }
    setCapturedMedia(null);
  }, [capturedMedia]);

  const handleConfirm = useCallback(() => {
    if (capturedMedia) {
      setIsProcessing(true);
      onCapture(capturedMedia.blob, capturedMedia.type);
      setIsProcessing(false);
      handleClose();
    }
  }, [capturedMedia, onCapture, handleClose]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        disabled={disabled}
        data-testid="button-video-capture"
      >
        <Video className="h-4 w-4" />
        <span className="sr-only">Capture video or photo</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Capture Photo or Video</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {capturedMedia ? (
              capturedMedia.type === "image" ? (
                <img 
                  src={capturedMedia.url} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                  data-testid="img-preview"
                />
              ) : (
                <video 
                  src={capturedMedia.url} 
                  controls 
                  className="w-full h-full object-cover"
                  data-testid="video-preview"
                />
              )
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="video-stream"
              />
            )}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-2 py-1 rounded-full text-xs">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Recording
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 pt-2">
            {capturedMedia ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  data-testid="button-retake"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  data-testid="button-confirm-capture"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Use this
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={capturePhoto}
                  disabled={isRecording}
                  data-testid="button-take-photo"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopVideoRecording : startVideoRecording}
                  data-testid="button-record-video"
                >
                  <Video className="h-4 w-4 mr-2" />
                  {isRecording ? "Stop" : "Record"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  data-testid="button-close-capture"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
