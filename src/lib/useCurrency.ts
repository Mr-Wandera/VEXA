import { useState, useEffect } from "react";
import { apiClient } from "./apiClient";
import { BusinessProfile } from "../types";

let cachedCurrency: string = "KSh";
let cacheLoaded = false;

export function useCurrency() {
  const [currency, setCurrency] = useState<string>(cachedCurrency);

  useEffect(() => {
    if (cacheLoaded) {
      setCurrency(cachedCurrency);
      return;
    }
    apiClient.getProfile()
      .then((profile: BusinessProfile) => {
        cachedCurrency = profile.currency || "KSh";
        setCurrency(cachedCurrency);
        cacheLoaded = true;
      })
      .catch(() => {
        setCurrency("KSh");
      });
  }, []);

  return currency;
}

export function formatCurrency(amount: number, currency: string = "KSh"): string {
  return `${currency} ${amount.toLocaleString()}`;
}
