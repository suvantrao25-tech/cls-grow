export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-8">
        CLS Grow
      </h2>

      <nav className="space-y-4">
        <a className="block text-gray-700 hover:text-blue-600">
          Dashboard
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          Business Profile
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          Growth Score
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          AI Suggestions
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          Tasks
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          Reviews
        </a>

        <a className="block text-gray-700 hover:text-blue-600">
          Settings
        </a>
      </nav>
    </aside>
  );
}