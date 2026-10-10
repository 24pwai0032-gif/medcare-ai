import { useEffect, useState } from 'react';

/** A preview URL for a local file, revoked as soon as the file changes or the component unmounts. */
export function useObjectUrl(file: File | null) {
  const [entry, setEntry] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Deferred so the URL isn't created twice per render in Strict Mode.
    const timer = setTimeout(() => setEntry({ file, url }));
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return entry && entry.file === file ? entry.url : null;
}
