import { useState } from "react";
import { Archive, Loader2 } from "lucide-react";

interface ZipEntry {
  path: string;
  url: string;
}

interface ZipDownloadButtonProps {
  entries: ZipEntry[];
  filename: string;
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
  readme?: string;
  /** Called once after a successful download completes. Use for analytics. */
  onDownloaded?: () => void;
}

export function ZipDownloadButton({
  entries,
  filename,
  label = "Download ZIP",
  className = "",
  variant = "primary",
  readme,
  onDownloaded,
}: ZipDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    setProgress(0);

    try {
      const { zip } = await import("fflate");

      const files: Record<string, Uint8Array> = {};

      if (readme) {
        files["README.md"] = new TextEncoder().encode(readme);
      }

      const total = entries.length;
      let done = 0;

      await Promise.all(
        entries.map(async (entry) => {
          try {
            const res = await fetch(entry.url);
            if (res.ok) {
              const buf = await res.arrayBuffer();
              files[entry.path] = new Uint8Array(buf);
            } else {
              files[entry.path] = new TextEncoder().encode(
                `# ${entry.path}\n\n_File not yet available in this release._\n`
              );
            }
          } catch {
            files[entry.path] = new TextEncoder().encode(
              `# ${entry.path}\n\n_Could not fetch: ${entry.url}_\n`
            );
          }
          done++;
          setProgress(Math.round((done / total) * 100));
        })
      );

      await new Promise<void>((resolve, reject) => {
        zip(files, { level: 6 }, (err, data) => {
          if (err) { reject(err); return; }
          const blob = new Blob([data], { type: "application/zip" });
          const href = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = href;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(href);
          onDownloaded?.();
          resolve();
        });
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  const baseClass =
    variant === "primary" ? "forge-btn-primary" : "forge-btn-outline";

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${baseClass} ${className}`}
      style={{ opacity: loading ? 0.8 : 1, minWidth: 160 }}
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          {progress > 0 ? `${progress}%` : "Assembling…"}
        </>
      ) : (
        <>
          <Archive size={13} />
          {label}
        </>
      )}
    </button>
  );
}
