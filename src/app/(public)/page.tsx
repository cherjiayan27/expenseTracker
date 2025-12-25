import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">Expense Tracker</h1>
        <p className="mt-4 text-xl text-gray-600">
          Track your expenses efficiently and effortlessly
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

