import { Router } from 'express';
import {
  getAllCountriesHandler,
  getRegionsByCountryHandler,
  getCitiesByRegionHandler,
} from './location.controller';

const router = Router();

// These routes are public as they are needed for registration and profile forms.

// GET /api/locations/countries
router.get('/countries', getAllCountriesHandler);

// GET /api/locations/countries/:countryId/regions
router.get('/countries/:countryId/regions', getRegionsByCountryHandler);

// GET /api/locations/regions/:regionId/cities
router.get('/regions/:regionId/cities', getCitiesByRegionHandler);

export default router;