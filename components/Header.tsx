export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-2xl font-bold text-blue-600">
        CLS Grow
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Business Owner
        </span>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
          B
        </div>
      </div>
    </header>
  );
}