import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
  "data-testid"?: string;
}

export default function FileUpload({
  onFilesChange,
  files,
  accept,
  multiple = false,
  placeholder = "Drop files here or click to upload",
  description = "Select files to upload",
  className,
  "data-testid": testId,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      onFilesChange([...files, ...acceptedFiles]);
    } else {
      onFilesChange(acceptedFiles.slice(0, 1));
    }
    setIsDragActive(false);
  }, [files, multiple, onFilesChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/50",
          files.length > 0 && !multiple ? "opacity-50 pointer-events-none" : ""
        )}
        data-testid={testId}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-foreground font-medium mb-1">
          {placeholder}
        </p>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
                data-testid={`file-item-${index}`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                  data-testid={`button-remove-file-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
