import { DatabaseSetup } from '@/components/setup/database-setup';

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">App Setup & Debugging</h1>
          <p className="text-gray-600">
            Configure your database, sync topics, and test the matching system.
          </p>
        </div>
        
        <DatabaseSetup />
      </div>
    </div>
  );
}
