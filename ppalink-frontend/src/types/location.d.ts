export interface Country {
  id: number;
  name: string;
  iso2: string;
}

export interface Region {
  id: number;
  name: string;
  countryId: number;
}

export interface City {
  id: number;
  name: string;
  regionId: number;
}