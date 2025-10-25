import useSWR from "swr";
import locationService from "../services/location.service";
import { useDataStore } from "../context/DataStore";

/**
 * A hook that takes location IDs and returns their corresponding names.
 * It intelligently fetches and caches data using SWR.
 * @param countryId
 * @param regionId
 * @param cityId
 */
export const useLocationNames = (
  countryId?: number | null,
  regionId?: number | null,
  cityId?: number | null
) => {
  // The DataStore is already fetching all countries, so we can use that directly.
  const { countries } = useDataStore();

  // Use SWR to fetch regions ONLY when countryId is present.
  // The key is an array, so SWR knows the dependency.
  const { data: regions, isLoading: isLoadingRegions } = useSWR(
    countryId ? ["regions", countryId] : null,
    ([_key, id]) => locationService.getRegions(id)
  );

  // Use SWR to fetch cities ONLY when regionId is present.
  const { data: cities, isLoading: isLoadingCities } = useSWR(
    regionId ? ["cities", regionId] : null,
    ([_key, id]) => locationService.getCities(id)
  );

  const countryName = countries?.find((c) => c.id === countryId)?.name;
  const regionName = regions?.find((r) => r.id === regionId)?.name;
  const cityName = cities?.find((c) => c.id === cityId)?.name;

  const isLoading =
    (countryId && !countries) ||
    (regionId && isLoadingRegions) ||
    (cityId && isLoadingCities);

  return {
    countryName,
    regionName,
    cityName,
    fullLocationString: [cityName, regionName, countryName]
      .filter(Boolean)
      .join(", "),
    isLoading,
  };
};
