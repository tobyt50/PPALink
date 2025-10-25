import apiClient from '../config/axios';
import type { Country, Region, City } from '../types/location';

class LocationService {
  async getCountries(): Promise<Country[]> {
    const response = await apiClient.get('/locations/countries');
    return response.data.data;
  }
  async getRegions(countryId: number): Promise<Region[]> {
    const response = await apiClient.get(`/locations/countries/${countryId}/regions`);
    return response.data.data;
  }
  async getCities(regionId: number): Promise<City[]> {
    const response = await apiClient.get(`/locations/regions/${regionId}/cities`);
    return response.data.data;
  }
}

export default new LocationService();