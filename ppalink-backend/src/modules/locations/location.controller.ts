import type { NextFunction, Request, Response } from 'express';
import { getAllCountries, getRegionsByCountry, getCitiesByRegion } from './location.service';

export async function getAllCountriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const countries = await getAllCountries();
    res.status(200).json({ success: true, data: countries });
  } catch (error) { next(error); }
}

export async function getRegionsByCountryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { countryId } = req.params;
    const regions = await getRegionsByCountry(parseInt(countryId, 10));
    res.status(200).json({ success: true, data: regions });
  } catch (error) { next(error); }
}

export async function getCitiesByRegionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { regionId } = req.params;
    const cities = await getCitiesByRegion(parseInt(regionId, 10));
    res.status(200).json({ success: true, data: cities });
  } catch (error) { next(error); }
}