import axios from 'axios';
import env from '../../config/env';

// Use a more advanced cache that can store rates for multiple base currencies
const ratesCache = new Map<string, { rates: Record<string, number>, time: number }>();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // Cache for 2 hours

/**
 * Fetches the latest exchange rates for a given base currency.
 * Uses a simple in-memory cache to limit API calls.
 * @param base The 3-letter ISO code for the base currency (defaults to NGN).
 */
export async function getExchangeRates(base: string = 'NGN') {
  const now = Date.now();
  const cached = ratesCache.get(base);

  if (cached && (now - cached.time < CACHE_DURATION)) {
    return cached.rates;
  }

  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${env.EXCHANGERATE_API_KEY}/latest/${base}`
    );

    if (response.data && response.data.result === 'success') {
      const rates = response.data.conversion_rates;
      ratesCache.set(base, { rates, time: now }); // Update the cache for this base currency
      return rates;
    } else {
      throw new Error(`Failed to fetch exchange rates from provider for base ${base}.`);
    }
  } catch (error) {
    console.error("Currency conversion API error:", error);
    if (cached) return cached.rates;
    throw error;
  }
}