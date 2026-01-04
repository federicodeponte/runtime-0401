import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Run FastAPI apps instantly
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Shareable. No setup. Auto-generated Run Pages from OpenAPI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/new"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </Link>
          <Link
            href="/projects"
            className="px-8 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Projects
          </Link>
        </div>
      </div>
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Import OpenAPI</h3>
          <p className="text-gray-600">Paste your OpenAPI spec and get instant endpoint explorer</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">▶️</div>
          <h3 className="text-lg font-semibold mb-2">Auto-Generated Forms</h3>
          <p className="text-gray-600">Run endpoints through beautiful generated forms</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold mb-2">Share Safely</h3>
          <p className="text-gray-600">Share Run Pages without leaking secrets</p>
        </div>
      </div>
    </div>
  );
}
