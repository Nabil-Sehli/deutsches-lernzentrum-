import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Building2, Mail, MapPin, Phone, ChevronLeft, ChevronRight, User } from "lucide-react";

export default function CenterPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.centerRequest.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-[#78909c] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#2c3e2d] mb-2">Center Not Found</h1>
          <p className="text-[#78909c] mb-6">This learning center does not exist or has not been approved yet.</p>
          <Link to="/" className="inline-flex items-center rounded-full bg-[#00695c] hover:bg-[#004d40] text-white px-6 py-2.5 font-semibold transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: data.themeColor ?? "#e8f5e9" }}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E6DFD3] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-[#182E21] font-bold text-base tracking-tight">
            DLZ
          </Link>
          <Link to="/" className="text-sm text-[#78909c] hover:text-[#00695c] transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ backgroundColor: data.themeColor ?? "#e8f5e9" }}>
          {data.banner && (
            <img
              src={data.banner}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 98%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 98%, transparent 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "intersect",
              }}
            />
          )}
          <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-28">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-5 md:p-8 w-fit max-w-lg">
              <div className="flex flex-row items-center gap-5">
                {data.logo && (
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl shrink-0 bg-white">
                    <img src={data.logo} alt={data.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white whitespace-nowrap">{data.name}</h1>
                  {data.description && (
                    <p className="text-sm md:text-base text-white/80 mt-1.5 whitespace-normal break-words">{data.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
          {/* Photo Album Slideshow */}
          {data.albums && data.albums.length > 0 && (
            <Slideshow images={data.albums.map((a) => a.imageUrl)} centerName={data.name} />
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teacher */}
            {data.teacher && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#00695c]/8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center overflow-hidden shrink-0">
                    {data.teacher.avatar ? (
                      <img src={data.teacher.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[#00695c]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#2c3e2d]">{data.teacher.name ?? "Teacher"}</h2>
                    <p className="text-xs text-[#78909c]">{data.teacher.email}</p>
                  </div>
                </div>
                {data.teacher.bio && (
                  <p className="text-sm text-[#2c3e2d] leading-relaxed">{data.teacher.bio}</p>
                )}
              </div>
            )}

            {/* Emails */}
            {data.emails && data.emails.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#00695c]/8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#00695c]" />
                  </div>
                  <h2 className="font-semibold text-[#2c3e2d]">Email</h2>
                </div>
                <div className="space-y-2">
                  {data.emails.map((e) => (
                    <a
                      key={e.id}
                      href={`mailto:${e.email}`}
                      className="block text-sm text-[#00695c] hover:underline"
                    >
                      {e.email}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {data.locations && data.locations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#00695c]/8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#00695c]" />
                  </div>
                  <h2 className="font-semibold text-[#2c3e2d]">Locations</h2>
                </div>
                <div className="space-y-3">
                  {data.locations.map((l) => (
                    <div key={l.id}>
                      <p className="text-sm font-medium text-[#2c3e2d]">{l.city}, {l.country}</p>
                      <p className="text-xs text-[#78909c]">{l.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phones */}
            {data.phones && data.phones.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#00695c]/8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#00695c]" />
                  </div>
                  <h2 className="font-semibold text-[#2c3e2d]">Phone</h2>
                </div>
                <div className="space-y-2">
                  {data.phones.map((p) => (
                    <a
                      key={p.id}
                      href={`tel:+${p.countryCode}${p.number}`}
                      className="block text-sm text-[#00695c] hover:underline"
                    >
                      +{p.countryCode} {p.number}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E6DFD3] bg-white/50 py-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-sm text-[#78909c]">
          &copy; {new Date().getFullYear()} Deutsches Lernzentrum (DLZ)
        </div>
      </footer>
    </div>
  );
}

function Slideshow({ images, centerName }: { images: string[]; centerName: string }) {
  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState<{ url: string; id: number } | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const fadeId = useRef(0);

  const goTo = useCallback((next: number) => {
    const id = ++fadeId.current;
    setFadeOut(false);
    setLeaving({ url: images[current], id });
    setCurrent(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFadeOut(true));
    });
    setTimeout(() => {
      setLeaving((prev) => prev?.id === id ? null : prev);
    }, 800);
  }, [current, images]);

  const prev = useCallback(() => {
    goTo(current === 0 ? images.length - 1 : current - 1);
  }, [current, images.length, goTo]);

  const next = useCallback(() => {
    goTo(current === images.length - 1 ? 0 : current + 1);
  }, [current, images.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (images.length === 0) return null;

  return (
    <div className="relative group">
      <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-lg bg-[#00695c]/5 relative">
        <img
          src={images[current]}
          alt={`${centerName} photo ${current + 1}`}
          className="w-full h-full object-cover"
        />
        {leaving && (
          <img
            key={leaving.id}
            src={leaving.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: fadeOut ? 0 : 1 }}
          />
        )}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-[#2c3e2d]" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-[#2c3e2d]" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
