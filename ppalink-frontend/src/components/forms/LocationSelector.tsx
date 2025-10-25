import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import useFetch from "../../hooks/useFetch";
import { DropdownTrigger } from "../ui/DropdownTrigger";
import { Label } from "../ui/Label";
import { SimpleDropdown, SimpleDropdownItem } from "../ui/SimpleDropdown";
import type { Country, Region, City } from "../../types/location";
import { Input } from "./Input";

const DisabledTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800/50 px-3 py-2 text-sm font-normal text-gray-400 dark:text-zinc-500 cursor-not-allowed">
    {children}
  </div>
);

interface LocationSelectorProps {
  stacked?: boolean;
  variant?: "full" | "country-only" | "region-city";
  resetKey?: number;  // New: Triggers search state reset
}

const LocationSelector = ({
  stacked = false,
  variant = "full",
  resetKey = 0,  // New: Default to 0
}: LocationSelectorProps) => {
  const { control, watch, setValue } = useFormContext();

  const watchedCountryId = watch("countryId");
  const watchedRegionId = watch("regionId");

  const { data: countries } = useFetch<Country[]>("/locations/countries");

  // Initialize fetch states with watched values on mount (syncs to form defaults without triggering clears)
  const [countryToFetchFor, setCountryToFetchFor] = useState(watchedCountryId);
  const [regionToFetchFor, setRegionToFetchFor] = useState(watchedRegionId);

  const { data: regions, isLoading: isLoadingRegions } = useFetch<Region[]>(
    countryToFetchFor
      ? `/locations/countries/${countryToFetchFor}/regions`
      : null
  );
  const { data: cities, isLoading: isLoadingCities } = useFetch<City[]>(
    regionToFetchFor ? `/locations/regions/${regionToFetchFor}/cities` : null
  );

  useEffect(() => {
    if (watchedCountryId !== countryToFetchFor) {
      setCountryToFetchFor(watchedCountryId);
      setValue("regionId", undefined, { shouldDirty: true });
      setValue("cityId", undefined, { shouldDirty: true });
    }
  }, [watchedCountryId, countryToFetchFor, setValue]);

  useEffect(() => {
    if (watchedRegionId !== regionToFetchFor) {
      setRegionToFetchFor(watchedRegionId);
      setValue("cityId", undefined, { shouldDirty: true });
    }
  }, [watchedRegionId, regionToFetchFor, setValue]);

  const [countrySearch, setCountrySearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // New: Clear search states when resetKey changes
  useEffect(() => {
    setCountrySearch("");
    setRegionSearch("");
    setCitySearch("");
  }, [resetKey]);

  const filteredCountries = countries?.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredRegions = regions?.filter((r) =>
    r.name.toLowerCase().includes(regionSearch.toLowerCase())
  );
  const filteredCities = cities?.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCountryName =
    countries?.find((c) => c.id === watchedCountryId)?.name ||
    "Select Country...";
  const selectedRegionName =
    regions?.find((r) => r.id === watchedRegionId)?.name ||
    "Select Region/State...";
  const selectedCityName =
    cities?.find((c) => c.id === watch("cityId"))?.name || "Select City/LGA...";

  const showCountry = variant !== "region-city";
  const showRegionCity = variant !== "country-only";
  const showRegion = showRegionCity;
  const showCity = showRegionCity;

  let cols = 1;
  if (!stacked) {
    if (showCountry && showRegion && showCity) {
      cols = 3;
    } else if (showRegionCity) {
      cols = 2;
    } else {
      cols = 1;
    }
  }

  return (
    <div className={`grid grid-cols-1 ${stacked ? "" : `sm:grid-cols-${cols}`} gap-6`}>
      {showCountry && (
        <div className="space-y-2">
          <Label>Country</Label>
          <Controller
            name="countryId"
            control={control}
            render={({ field: { onChange } }) => (
              <SimpleDropdown
                trigger={
                  <DropdownTrigger>
                    <span className="truncate">{selectedCountryName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownTrigger>
                }
              >
                <div className="p-2">
                  <Input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full px-2 py-1.5 text-sm border rounded"
                  />
                </div>
                {filteredCountries?.map((c) => (
                  <SimpleDropdownItem
                    key={c.id}
                    onSelect={() => {
                      onChange(c.id);
                      setCountrySearch("");
                    }}
                  >
                    {c.name}
                  </SimpleDropdownItem>
                ))}
              </SimpleDropdown>
            )}
          />
        </div>
      )}

      {showRegion && (
        <div className="space-y-2">
          <Label>Region / State</Label>
          <Controller
            name="regionId"
            control={control}
            render={({ field: { onChange } }) =>
              !watchedCountryId || isLoadingRegions ? (
                <DisabledTrigger>
                  {isLoadingRegions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="truncate">{selectedRegionName}</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </DisabledTrigger>
              ) : (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedRegionName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <div className="p-2">
                    <Input
                      type="text"
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      placeholder="Search regions..."
                      className="w-full px-2 py-1.5 text-sm border rounded"
                    />
                  </div>
                  {filteredRegions?.map((r) => (
                    <SimpleDropdownItem
                      key={r.id}
                      onSelect={() => {
                        onChange(r.id);
                        setRegionSearch("");
                      }}
                    >
                      {r.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )
            }
          />
        </div>
      )}

      {showCity && (
        <div className="space-y-2">
          <Label>City / LGA</Label>
          <Controller
            name="cityId"
            control={control}
            render={({ field: { onChange } }) =>
              !watchedRegionId || isLoadingCities ? (
                <DisabledTrigger>
                  {isLoadingCities ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="truncate">{selectedCityName}</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </DisabledTrigger>
              ) : (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedCityName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <div className="p-2">
                    <Input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search cities..."
                      className="w-full px-2 py-1.5 text-sm border rounded"
                    />
                  </div>
                  {filteredCities?.map((c) => (
                    <SimpleDropdownItem
                      key={c.id}
                      onSelect={() => {
                        onChange(c.id);
                        setCitySearch("");
                      }}
                    >
                      {c.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )
            }
          />
        </div>
      )}
    </div>
  );
};

export default LocationSelector;