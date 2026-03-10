import Navbar from '@/components/Navbar';
import StorageDashboard from '@/components/documents/StorageDashboard';
import PageUploadDropzone from '@/components/documents/PageUploadDropzone';
import DocumentTable from '@/components/documents/DocumentTable';
import DangerZone from '@/components/documents/DangerZone';

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar activePath="/documents" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6">
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <StorageDashboard />
        <PageUploadDropzone />
        <DocumentTable />
        <DangerZone />
      </main>
    </div>
  );
}
