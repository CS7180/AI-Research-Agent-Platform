export default function UploadDropzone() {
  return (
    <div className="px-3 pb-3">
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-4 transition-colors hover:border-primary hover:bg-primary-light"
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
      >
        <p className="text-xs text-muted">
          <span className="font-medium text-primary">Drop files</span> or click to upload
        </p>
      </div>
    </div>
  );
}
