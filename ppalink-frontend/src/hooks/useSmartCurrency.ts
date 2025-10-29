import { useCurrencyStore } from "../context/CurrencyStore";
import { useMemo, useEffect } from "react";

const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  CAD: "CA$",
  AUD: "A$",
};

function formatCurrency(amount: number, currency: string) {
  const symbol = currencySymbols[currency] || currency;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: currencySymbols[currency] ? "symbol" : "code",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/[A-Z]{3}/, symbol);
  } catch (error) {
    return `${symbol}${amount.toLocaleString()}`;
  }
}

export const useSmartCurrency = (
  amount: number | null | undefined,
  originalCurrency: string | null | undefined
): string => {
  const { viewerCurrency, rateSets, fetchRates } = useCurrencyStore();

  useEffect(() => {
    if (originalCurrency && !rateSets[originalCurrency]) {
      fetchRates(originalCurrency);
    }
  }, [originalCurrency, rateSets, fetchRates]);

  return useMemo(() => {
    if (amount == null || !originalCurrency) {
      return "Not specified";
    }

    const originalFormatted = formatCurrency(amount, originalCurrency);

    if (
      originalCurrency === viewerCurrency ||
      !viewerCurrency ||
      !rateSets[originalCurrency]
    ) {
      return originalFormatted;
    }

    const rate = rateSets[originalCurrency][viewerCurrency];
    if (!rate) {
      return originalFormatted;
    }

    const convertedAmount = amount * rate;
    const convertedFormatted = formatCurrency(convertedAmount, viewerCurrency);

    return `${originalFormatted} (≈ ${convertedFormatted})`;
  }, [amount, originalCurrency, viewerCurrency, rateSets]);
};
