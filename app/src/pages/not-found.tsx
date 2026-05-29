import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 p-6 rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
          <h1 className="text-xl font-bold text-foreground">404 — Page Not Found</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This page doesn't exist. Check the URL or navigate back to the{" "}
          <a href="/" className="text-primary underline-offset-2 hover:underline">
            homepage
          </a>
          .
        </p>
      </div>
    </div>
  );
}
