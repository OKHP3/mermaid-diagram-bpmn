import { type VariableFile } from "@/data/skills-registry";
import { DownloadButton } from "./DownloadButton";
import { FileText } from "lucide-react";

interface VariableFileCardProps {
  file: VariableFile;
}

export function VariableFileCard({ file }: VariableFileCardProps) {
  const shownFields = file.requiredFields.slice(0, 5);
  const extraFields = file.requiredFields.length - shownFields.length;

  return (
    <div className="forge-card flex flex-col gap-3 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-2">
        <FileText size={14} className="text-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <code className="text-xs font-mono font-semibold text-foreground truncate">
            {file.filename}
          </code>
          <p className="text-[11px] text-muted-foreground">{file.displayName}</p>
        </div>
        <span
          className="forge-status-pill shrink-0 text-[9px] border-primary/30 text-primary bg-primary/8"
        >
          Used by {file.usedBy.length}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">{file.description}</p>

      {/* Required fields */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">
          Required fields
        </p>
        <div className="flex flex-wrap gap-1">
          {shownFields.map((f) => (
            <code
              key={f}
              className="text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground"
            >
              {f}
            </code>
          ))}
          {extraFields > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              +{extraFields} more
            </span>
          )}
        </div>
      </div>

      {/* Download */}
      <div className="pt-1 border-t border-border">
        <DownloadButton
          url={`${import.meta.env.BASE_URL}context/${file.filename}`}
          filename={file.filename}
          label="Download Template"
          variant="outline"
          className="w-full justify-center text-xs"
        />
      </div>
    </div>
  );
}
