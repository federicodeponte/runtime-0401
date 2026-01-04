import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center text-2xl font-semibold text-gray-900 hover:text-gray-700"
            >
              RunIt
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Projects
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Demo
              </Link>
              <Link
                href="/new"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
