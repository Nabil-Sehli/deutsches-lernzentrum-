import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Building2, Mail, MapPin, Phone, ChevronLeft, ChevronRight, User } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -41] });

export default function CenterPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.centerRequest.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (data?.name) document.title = data.name;
  }, [data?.name]);

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
    <div className="min-h-screen relative" style={{ backgroundColor: data.themeColor ?? "#e8f5e9" }}>
      <ContourLines />
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E6DFD3] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-3">
          <span className="font-serif text-[#182E21] font-bold text-lg md:text-xl tracking-tight">
            {data.name}
          </span>
          <span className="text-[10px] md:text-xs text-[#78909c]/40 mt-0.5">
            powered by{" "}
            <a href="/" className="text-[#78909c]/40 hover:text-[#00695c] transition-colors">
              DLZ
            </a>
          </span>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative" style={{ backgroundColor: data.themeColor ?? "#e8f5e9" }}>
          {data.banner ? (
            <div className="relative h-52 md:h-64 overflow-hidden">
              <img
                src={data.banner}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                }}
              />
            </div>
          ) : (
            <div className="h-20 md:h-28" />
          )}
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-14 md:-mt-20 relative z-10">
              {data.logo && (
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl shrink-0 bg-white">
                  <img src={data.logo} alt={data.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="mt-3 sm:mt-0 sm:ml-5 md:ml-7 pb-2">
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl px-5 py-4 md:px-7 md:py-5 border border-white/20 shadow-lg">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{data.name}</h1>
                  {data.description && (
                    <p className="text-sm md:text-base text-white/80 mt-1 whitespace-normal break-words">{data.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          {/* Photo Album Slideshow */}
          {data.albums && data.albums.length > 0 && (
            <Slideshow images={data.albums.map((a) => a.imageUrl)} centerName={data.name} />
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teacher */}
            {data.teacher && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center overflow-hidden shrink-0">
                    {data.teacher.avatar ? (
                      <img src={data.teacher.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[#00695c]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#2c3e2d]">{data.teacher.title ? `${data.teacher.title}. ` : ""}{data.teacher.name ?? "Teacher"}</h2>
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
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
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
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
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
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
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

          {/* Map */}
          {data.locations && data.locations.length > 0 && (
            <MapView locations={data.locations} />
          )}
        </div>
      </main>

      <footer className="border-t border-[#E6DFD3] bg-white/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#78909c]">
          &copy; {new Date().getFullYear()} Deutsches Lernzentrum (DLZ)
        </div>
      </footer>
    </div>
  );
}

function ContourLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="center-contour"
            patternUnits="userSpaceOnUse"
            width="120"
            height="80"
            patternTransform="scale(1.5)"
          >
            <path
              d="M0,40 Q30,20 60,40 T120,40"
              fill="none"
              stroke="#182E21"
              strokeWidth="2"
            />
            <path
              d="M0,20 Q30,0 60,20 T120,20"
              fill="none"
              stroke="#182E21"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M0,60 Q30,40 60,60 T120,60"
              fill="none"
              stroke="#182E21"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M0,0 Q30,-20 60,0 T120,0"
              fill="none"
              stroke="#182E21"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M0,80 Q30,60 60,80 T120,80"
              fill="none"
              stroke="#182E21"
              strokeWidth="1"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#center-contour)" />
      </svg>
    </div>
  );
}

function lookupCountry(country: string): [number, number] | null {
  const countryAliases: Record<string, string> = {
    "Deutschland": "Germany", "Frankreich": "France", "Italien": "Italy", "Spanien": "Spain",
    "Vereinigtes Königreich": "United Kingdom", "Österreich": "Austria", "Schweiz": "Switzerland",
    "Niederlande": "Netherlands", "Belgien": "Belgium", "Polen": "Poland",
    "Tschechien": "Czech Republic", "Schweden": "Sweden", "Norwegen": "Norway",
    "Dänemark": "Denmark", "Griechenland": "Greece", "Portugal": "Portugal",
    "Türkei": "Turkey", "Vereinigte Staaten": "United States", "USA": "United States",
    "Kanada": "Canada", "Algerien": "Algeria", "Indien": "India",
    "China": "China", "Japan": "Japan", "Australien": "Australia",
    "Brasilien": "Brazil", "Argentinien": "Argentina", "Mexiko": "Mexico",
    "Russland": "Russia",     "Ägypten": "Egypt",
    "Kroatien": "Croatia", "Slowenien": "Slovenia", "Ungarn": "Hungary",
    "Rumänien": "Romania", "Bulgarien": "Bulgaria", "Serbien": "Serbia",
    "Slowakei": "Slovakia", "Litauen": "Lithuania", "Lettland": "Latvia",
    "Estland": "Estonia", "Finnland": "Finland", "Irland": "Ireland",
    "Luxemburg": "Luxembourg", "Ukraine": "Ukraine", "Weißrussland": "Belarus",
    "Marokko": "Morocco", "Tunesien": "Tunisia", "Israel": "Israel",
    "Südkorea": "South Korea", "Thailand": "Thailand", "Vietnam": "Vietnam",
    "Philippinen": "Philippines",
  };
  const resolved = countryAliases[country] ?? country;
  return countryCoords[resolved] ?? null;
}

const countryCoords: Record<string, [number, number]> = {
  "Germany": [51.1657, 10.4515], "France": [46.6034, 1.8883], "Italy": [41.8719, 12.5674], "Spain": [40.4637, -3.7492],
  "United Kingdom": [55.3781, -3.4360], "Austria": [47.5162, 14.5501], "Switzerland": [46.8182, 8.2275],
  "Netherlands": [52.1326, 5.2913], "Belgium": [50.8503, 4.3517], "Poland": [51.9194, 19.1451],
  "Czech Republic": [49.8175, 15.4730], "Sweden": [60.1282, 18.6435], "Norway": [60.4720, 8.4689],
  "Denmark": [56.2639, 9.5018], "Greece": [39.0742, 21.8243], "Portugal": [39.3999, -8.2245],
  "Turkey": [38.9637, 35.2433], "United States": [37.0902, -95.7129], "Canada": [56.1304, -106.3468],
  "Algeria": [28.0339, 1.6596], "Bangladesh": [23.685, 90.3563], "India": [20.5937, 78.9629],
  "China": [35.8617, 104.1954], "Japan": [36.2048, 138.2529], "Australia": [-25.2744, 133.7751],
  "Brazil": [-14.2350, -51.9253], "Argentina": [-38.4161, -63.6167], "Mexico": [23.6345, -102.5528],
  "Russia": [61.5240, 105.3188], "Egypt": [26.8206, 30.8025], "South Africa": [-30.5595, 22.9375],
  "Croatia": [45.1, 15.2], "Slovenia": [46.1512, 14.9955], "Hungary": [47.1625, 19.5033],
  "Romania": [45.9432, 24.9668], "Bulgaria": [42.7339, 25.4858], "Serbia": [44.0165, 21.0059],
  "Slovakia": [48.6690, 19.6990], "Lithuania": [55.1694, 23.8813], "Latvia": [56.8796, 24.6032],
  "Estonia": [58.5953, 25.0136], "Finland": [61.9241, 25.7482], "Ireland": [53.1424, -7.6921],
  "Luxembourg": [49.8153, 6.1296], "Ukraine": [48.3794, 31.1656], "Belarus": [53.7098, 27.9534],
  "Morocco": [31.7917, -7.0926], "Tunisia": [33.8869, 9.5375], "Saudi Arabia": [23.8859, 45.0792],
  "United Arab Emirates": [23.4241, 53.8478], "Qatar": [25.3548, 51.1839], "Kuwait": [29.3117, 47.4818],
  "South Korea": [35.9078, 127.7669], "Taiwan": [23.6978, 120.9605], "Thailand": [15.8700, 100.9925],
  "Vietnam": [14.0583, 108.2772], "Philippines": [12.8797, 121.7740], "Israel": [31.0461, 34.8516],
};

function MapView({ locations }: { locations: { country: string; city: string; address: string }[] }) {
  const coords = locations.map((l) => lookupCountry(l.country)).filter((c): c is [number, number] => c !== null);

  if (coords.length === 0) return null;

  const center: [number, number] = coords.length > 1
    ? [coords.reduce((s, c) => s + c[0], 0) / coords.length, coords.reduce((s, c) => s + c[1], 0) / coords.length]
    : coords[0];

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl border border-white/50 h-[350px]">
      <MapContainer center={center} zoom={coords.length > 1 ? 5 : 12} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>' />
        {coords.map((c, i) => (
          <Marker key={i} position={c} icon={markerIcon}>
            <Popup>{locations[i].city}, {locations[i].country} {locations[i].address}</Popup>
          </Marker>
        ))}
      </MapContainer>
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
      <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 bg-[#00695c]/5 relative">
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
