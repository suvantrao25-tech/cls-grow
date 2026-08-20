import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <h1 className="text-4xl font-bold text-gray-900">
          CLS GROW
        </h1>

        <p className="mt-3 text-lg text-gray-500">
          Grow Your Business Smarter.
        </p>

        <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          <Link
            href="/signup"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Get Started
          </Link>

          <div className="mt-5 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Business Login
            </Link>
          </div>

        </div>

        <div className="mt-8">
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            Admin Access →
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          © 2026 CLS GROW. All rights reserved.
        </p>

      </div>
    </main>
  );
}
