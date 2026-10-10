import { Camera, ImageUp } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCEPTED_TYPES } from './modules';

interface DropzoneProps {
  onFile: (file: File) => void;
  describedBy?: string;
}

/**
 * Drag and drop for mouse users; real buttons for keyboard, screen-reader and touch users.
 * "Take a photo" only appears on touch devices, where it opens the rear camera.
 */
export function Dropzone({ onFile, describedBy }: DropzoneProps) {
  const { t } = useTranslation('analyzer');
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const take = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-input bg-surface px-4 py-8 text-center transition-colors',
        dragging && 'border-primary bg-secondary',
      )}
    >
      <ImageUp className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium" aria-live="polite">
        {dragging ? t('upload.dropActive') : t('upload.drop')}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => fileInput.current?.click()} aria-describedby={describedBy}>
          {t('upload.choose')}
        </Button>
        <Button
          variant="outline"
          className="hidden pointer-coarse:inline-flex"
          onClick={() => cameraInput.current?.click()}
          aria-describedby={describedBy}
        >
          <Camera aria-hidden="true" />
          {t('upload.camera')}
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        data-testid="file-input"
        onChange={(event) => {
          take(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          take(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
