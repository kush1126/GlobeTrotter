import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  currency?: string;
  language?: string;
}


export interface Activity {
  id: string;
  stopId: string;
  name: string;
  category: "sightseeing" | "food" | "transport" | "stay" | "other";
  date: string;
  startTime?: string;
  endTime?: string;
  estimatedCost: string;
  currency: string;
  notes?: string;
}

export interface TripStop {
  id: string;
  tripId: string;
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  plannedBudget?: string | null;
  notes?: string | null;
  activities: Activity[];
}

export interface TripShare {
  id: string;
  permission: "view" | "edit";
  sharedWithUser: { id: string; name: string; email: string } | null;
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  shareToken: string;
  stops: TripStop[];
  shares?: TripShare[];
  viewerCanEdit?: boolean;
  viewerIsOwner?: boolean;
}

export interface CatalogItem {
  id: string;
  city: string;
  country: string;
  name: string;
  category: "sightseeing" | "food" | "transport" | "stay" | "other";
  avgCost: string;
  currency: string;
  rating: number | null;
  description: string | null;
  imageUrl: string | null;
}

export interface SearchMeta {
  countries: string[];
  cities: { city: string; country: string }[];
  categories: string[];
}

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", data),
  me: () => api.get<User>("/auth/me"),
  updateMe: (data: { name?: string; avatarUrl?: string; currency?: string; language?: string }) =>
    api.patch<User>("/auth/me", data),
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  "USD ($)": "$",
  "EUR (€)": "€",
  "GBP (£)": "£",
  "INR (₹)": "₹",
  "JPY (¥)": "¥",
};

export const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  JPY: 155,
  "USD ($)": 1,
  "EUR (€)": 0.92,
  "GBP (£)": 0.78,
  "INR (₹)": 83.5,
  "JPY (¥)": 155,
};

export function formatPrice(amountInUSD: number | string, userCurrency = "USD"): string {
  const num = Number(amountInUSD) || 0;
  const code = userCurrency ? userCurrency.split(" ")[0] : "USD";
  const symbol = CURRENCY_SYMBOLS[userCurrency] || CURRENCY_SYMBOLS[code] || "$";
  const rate = CURRENCY_RATES[userCurrency] || CURRENCY_RATES[code] || 1;
  const converted = num * rate;
  return `${symbol}${converted.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}


// ---- Trips ----
export const tripsApi = {
  list: () => api.get<Trip[]>("/trips"),
  get: (id: string) => api.get<Trip>(`/trips/${id}`),
  create: (data: { title: string; description?: string; coverImage?: string; startDate: string; endDate: string }) =>
    api.post<Trip>("/trips", data),
  update: (id: string, data: Partial<Trip>) => api.patch<Trip>(`/trips/${id}`, data),
  remove: (id: string) => api.delete(`/trips/${id}`),
  addStop: (
    tripId: string,
    data: {
      city: string;
      country: string;
      arrivalDate: string;
      departureDate: string;
      orderIndex: number;
      plannedBudget?: number;
      notes?: string;
    }
  ) => api.post<TripStop>(`/trips/${tripId}/stops`, data),
  budget: (id: string) =>
    api.get<{
      planned: { category: string; plannedAmount: string }[];
      actualByCategory: { category: string; total: number }[];
      totalPlanned: number;
      totalActual: number;
    }>(`/trips/${id}/budget`),
  calendar: (id: string) => api.get<Record<string, (Activity & { city: string })[]>>(`/trips/${id}/calendar`),
  share: (id: string, data: { makePublic?: boolean; inviteEmail?: string; permission?: "view" | "edit" }) =>
    api.post<Trip>(`/trips/${id}/share`, data),
  revokeShare: (tripId: string, shareId: string) => api.delete(`/trips/${tripId}/share/${shareId}`),
  copyPublic: (shareToken: string) => api.post<Trip>(`/public/trips/${shareToken}/copy`),
};


// ---- Stops / Activities ----
export const stopsApi = {
  update: (id: string, data: Partial<TripStop>) => api.patch<TripStop>(`/stops/${id}`, data),
  remove: (id: string) => api.delete(`/stops/${id}`),
  addActivity: (
    stopId: string,
    data: Omit<Activity, "id" | "stopId" | "estimatedCost"> & { estimatedCost: number }
  ) => api.post<Activity>(`/stops/${stopId}/activities`, data),
};

export const activitiesApi = {
  update: (id: string, data: Partial<Activity>) => api.patch<Activity>(`/activities/${id}`, data),
  remove: (id: string) => api.delete(`/activities/${id}`),
};

// ---- Search ----
export const searchApi = {
  meta: () => api.get<SearchMeta>("/search/meta"),
  activities: (params: {
    city?: string;
    country?: string;
    category?: string;
    maxCost?: number;
    q?: string;
  }) => api.get<CatalogItem[]>("/search/activities", { params }),
  destinations: (q?: string) =>
    api.get<{ city: string; country: string; imageUrl?: string }[]>("/search/destinations", {
      params: { q },
    }),
};

// ---- Community ----
export interface CommunityTrip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  shareToken: string;
  user: { id: string; name: string };
  stops: { city: string; country: string }[];
}

export const communityApi = {
  list: (q?: string) => api.get<CommunityTrip[]>("/community/trips", { params: { q } }),
};

// ---- Calendar ----
export interface CalendarTripSummary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export const globalCalendarApi = {
  mine: () => api.get<CalendarTripSummary[]>("/calendar/mine"),
};
