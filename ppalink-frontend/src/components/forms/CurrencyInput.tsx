import { useEffect, useMemo, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "./Input";
import { Label } from "../ui/Label";
import { useDataStore } from "../../context/DataStore";
import { SimpleDropdown, SimpleDropdownItem } from "../ui/SimpleDropdown";
import { DropdownTrigger } from "../ui/DropdownTrigger";
import { ChevronDown } from "lucide-react";

interface CurrencyInputProps {
  label: string;
  amountFieldName: string; // The name of the salary field, e.g., "minSalary"
  currencyFieldName: string; // The name of the currency field, e.g., "currency"
}

export const CurrencyInput = ({
  label,
  amountFieldName,
  currencyFieldName,
}: CurrencyInputProps) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { countries } = useDataStore();

  // Watch the selected country ID from the main form
  const watchedCountryId = watch("countryId");

  const allCurrencies = useMemo(() => {
    const currencySet = new Set<string>();
    countries.forEach((c) => c.currency && currencySet.add(c.currency));
    return Array.from(currencySet).sort();
  }, [countries]);

  // Intelligently auto-select the currency when the country changes.
  useEffect(() => {
    if (watchedCountryId) {
      const selectedCountry = countries.find((c) => c.id === watchedCountryId);
      if (selectedCountry?.currency) {
        setValue(currencyFieldName, selectedCountry.currency, {
          shouldDirty: true,
        });
      }
    }
  }, [watchedCountryId, countries, setValue, currencyFieldName]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = useMemo(() => {
    return allCurrencies.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allCurrencies, searchQuery]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={amountFieldName}>{label}</Label>
      <div className="flex">
        <Controller
          name={currencyFieldName}
          render={({ field }) => (
            <SimpleDropdown
              trigger={
                <DropdownTrigger className="w-auto min-w-[120px] rounded-2xl !rounded-r-none border-r-0 bg-gray-50 dark:bg-zinc-800 shadow-none dark:shadow-none dark:ring-0 hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <span className="truncate">
                    {field.value || "Select Currency..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </DropdownTrigger>
              }
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 px-3 py-2">
                <Input
                  type="text"
                  placeholder="Search currency..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              {filteredCurrencies.map((c) => (
                <SimpleDropdownItem key={c} onSelect={() => field.onChange(c)}>
                  {c}
                </SimpleDropdownItem>
              ))}
            </SimpleDropdown>
          )}
        />
        <Input
          id={amountFieldName}
          type="number"
          className="rounded-l-none flex-1"
          placeholder="e.g., 50000"
          {...useFormContext().register(amountFieldName, {
            setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
          })}
        />
      </div>
      {(errors[amountFieldName] || errors[currencyFieldName]) && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {(errors[amountFieldName]?.message as string) ||
            (errors[currencyFieldName]?.message as string)}
        </p>
      )}
    </div>
  );
};
