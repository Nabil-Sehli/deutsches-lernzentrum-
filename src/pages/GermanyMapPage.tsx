import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import GermanyMap3D from "@/components/GermanyMap3D";
import type { GermanState } from "@/data/german-states";
import { ArrowLeft, MapPin, Users, Globe, Info, X } from "lucide-react";

export default function GermanyMapPage() {
  const { t, i18n } = useTranslation();
  const [selectedState, setSelectedState] = useState<GermanState | null>(null);
  const isDe = i18n.language?.startsWith("de");

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />
      <div className="pt-20 pb-6 px-6">
        <div className="max-w-[1400px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 3D Map */}
            <div className="flex-1 min-h-[500px] lg:min-h-[650px] rounded-3xl shadow-lg overflow-hidden">
              <GermanyMap3D
                onSelectState={(state) => setSelectedState(state)}
              />
            </div>

            {/* Info Panel */}
            <div className="w-full lg:w-80 shrink-0">
              {selectedState ? (
                <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedState.color }}
                      />
                      <h2 className="text-xl font-bold text-[#2c3e2d]">
                        {isDe ? selectedState.nameDe : selectedState.nameEn}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedState(null)}
                      className="text-[#78909c] hover:text-[#2c3e2d] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#78909c]">
                      <MapPin className="w-4 h-4 text-[#00695c]" />
                      <span>
                        {t("map.capital")}:{" "}
                        <strong className="text-[#2c3e2d]">
                          {isDe
                            ? selectedState.capitalDe
                            : selectedState.capital}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#78909c]">
                      <Users className="w-4 h-4 text-[#00695c]" />
                      <span>
                        {t("map.population")}:{" "}
                        <strong className="text-[#2c3e2d]">
                          {selectedState.population}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#78909c]">
                      <Globe className="w-4 h-4 text-[#00695c]" />
                      <span>
                        {t("map.area")}:{" "}
                        <strong className="text-[#2c3e2d]">
                          {selectedState.area}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#00695c]/8">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#00695c] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#78909c] leading-relaxed">
                        {isDe
                          ? selectedState.descriptionDe
                          : selectedState.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                  <MapPin className="w-12 h-12 text-[#00695c] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                    {t("map.selectState")}
                  </h3>
                  <p className="text-sm text-[#78909c]">
                    {t("map.selectHint")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
