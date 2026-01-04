import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-2">Manage your FastAPI projects</p>
      </div>

      {/* Empty state */}
      <div className="text-center py-24">
        <div className="text-6xl mb-6">📦</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No projects yet
        </h2>
        <p className="text-gray-600 mb-8">
          Get started by creating your first FastAPI project
        </p>
        <Link
          href="/new"
          className="inline-flex px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create your first project
        </Link>
      </div>
    </div>
  );
}
