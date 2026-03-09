import FileItem from '@/components/documents/FileItem';

interface FileData {
  name: string;
  type: 'pdf' | 'md' | 'txt';
  size: string;
  status: 'ready' | 'processing' | 'pending' | 'failed';
}

interface FolderSectionProps {
  name: string;
  fileCount: number;
  files: FileData[];
}

export default function FolderSection({ name, fileCount, files }: FolderSectionProps) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <span className="text-xs font-semibold text-foreground">{name}</span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border-light text-[10px] text-muted">
          {fileCount}
        </span>
      </div>
      <ul className="ml-2 space-y-0" role="list">
        {files.map((file) => (
          <FileItem key={file.name} {...file} />
        ))}
      </ul>
    </div>
  );
}
