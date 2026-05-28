import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, File, ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/types/aiSetup';

interface DocumentUploaderProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (id: string) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ACCEPTED_EXTENSIONS = '.pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.webp';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: UploadedFile) {
  const { type } = file.file;
  if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-400" />;
  if (type === 'application/pdf') return <FileText className="h-4 w-4 text-rose-400" />;
  return <File className="h-4 w-4 text-indigo-400" />;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  files,
  onFilesAdded,
  onFileRemoved,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) onFilesAdded(dropped);
    },
    [disabled, onFilesAdded]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) onFilesAdded(selected);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 text-center select-none',
          isDragging
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Icon */}
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}
        >
          <Upload
            className={cn(
              'h-7 w-7 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isDragging ? 'Drop files here' : 'Drop files or click to upload'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, Word, TXT, or images · Max 50 MB per file
          </p>
        </div>

        {/* Accepted formats badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {['PDF', 'DOCX', 'TXT', 'JPG', 'PNG'].map((ext) => (
            <span
              key={ext}
              className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              {ext}
            </span>
          ))}
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                {/* Icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {getFileIcon(file)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>

                  {/* Progress bar */}
                  {(file.status === 'uploading' || file.status === 'reading') && (
                    <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                  <div className="shrink-0 flex items-center gap-2">
                    {file.status === 'done' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                    )}
                    {!disabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileRemoved(file.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUploader;
