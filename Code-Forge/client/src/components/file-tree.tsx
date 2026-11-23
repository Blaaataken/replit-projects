import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "@shared/schema";

interface FileTreeProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedFile?: string;
}

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  onFileSelect?: (file: FileNode) => void;
  selectedFile?: string;
}

function FileTreeNode({ node, depth, onFileSelect, selectedFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile === node.name;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(node);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "h-4 w-4 flex-shrink-0";
    
    if (ext === 'ts' || ext === 'tsx') {
      return <File className={`${iconClass} text-blue-500`} />;
    } else if (ext === 'js' || ext === 'jsx') {
      return <File className={`${iconClass} text-yellow-500`} />;
    } else if (ext === 'json') {
      return <File className={`${iconClass} text-orange-500`} />;
    } else if (ext === 'md') {
      return <File className={`${iconClass} text-muted-foreground`} />;
    } else if (ext === 'css' || ext === 'scss') {
      return <File className={`${iconClass} text-pink-500`} />;
    } else if (ext === 'py') {
      return <File className={`${iconClass} text-green-500`} />;
    } else if (ext === 'go') {
      return <File className={`${iconClass} text-cyan-500`} />;
    } else if (ext === 'rs') {
      return <File className={`${iconClass} text-orange-600`} />;
    }
    return <File className={`${iconClass} text-muted-foreground`} />;
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover-elevate rounded-md font-mono text-sm ${
          isSelected ? "bg-accent" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        data-testid={`tree-node-${node.name}`}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-primary" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.name}-${index}`}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, onFileSelect, selectedFile }: FileTreeProps) {
  return (
    <div className="py-2">
      {files.map((file, index) => (
        <FileTreeNode
          key={`${file.name}-${index}`}
          node={file}
          depth={0}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}
