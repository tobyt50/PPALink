import type { NextFunction, Request, Response } from 'express';
import { getExchangeRates } from './currency.service';

/**
 * Handler for fetching the latest currency exchange rates.
 */
export async function getExchangeRatesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Get the optional `base` currency from the query string
    const baseCurrency = req.query.base as string | undefined;
    const rates = await getExchangeRates(baseCurrency);
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    // We send a generic error to the client, but the service logs the specific API error.
    res.status(503).json({ success: false, message: 'Could not retrieve exchange rates at this time.' });
  }
}