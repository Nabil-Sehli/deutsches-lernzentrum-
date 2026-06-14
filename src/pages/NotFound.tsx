import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#00695c]/8 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#00695c]" />
        </div>
        <h1 className="text-5xl font-bold text-[#00695c] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#2c3e2d] mb-3">
          Page Not Found
        </h2>
        <p className="text-[#78909c] mb-8 max-w-sm mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button className="rounded-full bg-[#00695c] hover:bg-[#004d40] px-6">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
