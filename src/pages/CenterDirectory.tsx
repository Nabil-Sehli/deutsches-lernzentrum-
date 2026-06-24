import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Building2, MapPin, Star, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CenterDirectory() {
  const { data: centers, isLoading } = trpc.center.list.useQuery();
  const [search, setSearch] = useState("");

  const filtered = centers?.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">German Learning Centers</h1>
          <p className="text-[#78909c]">Browse certified German language teaching centers</p>
        </div>

        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78909c]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search centers..."
            className="pl-10 rounded-full h-12 bg-white border-[#00695c]/15"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-[#78909c] mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#2c3e2d]">No centers found</p>
            <p className="text-[#78909c]">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((center) => (
              <Link
                key={center.id}
                to={`/c/${center.slug}`}
                className="block bg-white rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {center.logo ? (
                    <img src={center.logo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#00695c]/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-7 h-7 text-[#00695c]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#2c3e2d] truncate">{center.name}</h3>
                    {center.description && (
                      <p className="text-sm text-[#78909c] line-clamp-2 mt-1">{center.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#78909c]">
                      {center.locations && center.locations.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {center.locations.length} location{center.locations.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
