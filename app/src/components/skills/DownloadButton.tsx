import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  url: string;
  filename: string;
  label?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function DownloadButton({
  url,
  filename,
  label = "Download",
  className = "",
  variant = "outline",
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setLoading(false);
    }
  }

  const baseClass =
    variant === "primary"
      ? "forge-btn-primary"
      : variant === "outline"
        ? "forge-btn-outline"
        : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-primary hover:bg-primary/8 transition-colors";

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${baseClass} ${className}`}
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Download size={13} />
      )}
      {label}
    </button>
  );
}
