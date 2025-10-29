export interface Country {
  id: number;
  name: string;
  iso2: string;
  currency: string | null;
  capital: string | null;
  phonecode: string | null;
  emoji: string | null;
  latitude: number | null;
  longitude: number | null;
}
export interface Region {
  id: number;
  name: string;
  countryId: number;
  latitude: number | null;
  longitude: number | null;
}

export interface City {
  id: number;
  name: string;
  regionId: number;
  latitude: number | null;
  longitude: number | null;
}