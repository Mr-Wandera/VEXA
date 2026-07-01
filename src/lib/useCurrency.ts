import { useState, useEffect } from "react";
import { apiClient } from "./apiClient";
import { BusinessProfile } from "../types";

let cachedCurrency: string = "KSh";
let cacheLoaded = false;
const listeners = new Set<(c: string) => void>();

export function invalidateCurrencyCache() {
  cacheLoaded = false;
  apiClient.getProfile()
    .then((profile: BusinessProfile) => {
      cachedCurrency = profile.currency || "KSh";
      cacheLoaded = true;
      listeners.forEach((fn) => fn(cachedCurrency));
    })
    .catch(() => {});
}

export function useCurrency() {
  const [currency, setCurrency] = useState<string>(cachedCurrency);

  useEffect(() => {
    if (cacheLoaded) {
      setCurrency(cachedCurrency);
      return;
    }
    const load = (c: string) => setCurrency(c);
    listeners.add(load);
    apiClient.getProfile()
      .then((profile: BusinessProfile) => {
        cachedCurrency = profile.currency || "KSh";
        setCurrency(cachedCurrency);
        cacheLoaded = true;
        listeners.forEach((fn) => fn(cachedCurrency));
      })
      .catch(() => setCurrency("KSh"));
    return () => { listeners.delete(load); };
  }, []);

  return currency;
}

export function formatCurrency(amount: number, currency: string = "KSh"): string {
  return `${currency} ${amount.toLocaleString()}`;
}
