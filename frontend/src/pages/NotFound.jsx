import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="flex justify-center w-full items-center flex-col h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white py-10 gap-5">
        <h1 className="max-[300px]:text-7xl pb-2 text-[100px] font-bold font-raleway text-[#ffc107] leading-none">404</h1>
        <p className="max-[300px]:text-xl text-2xl md:text-3xl font-semibold mb-4 font-raleway text-white/90">
          Oops! Page not found.
        </p>
        <p className="max-[300px]:text-xs text-sm text-white/70 mb-6 max-w-sm mx-auto">
          The page you're looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="max-[300px]:text-xs inline-flex flex-wrap justify-center items-center gap-2 px-5 py-2.5 rounded-full bg-[#4c6ef5] hover:bg-[#3b5bdb] transition-all text-sm font-medium"
        >
          <MoveLeft className="w-4 h-4" />
          Go Back Home
        </Link>
    </section>
  );
}

export default NotFound;
