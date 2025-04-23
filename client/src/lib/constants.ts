// API endpoints
export const API = {
  AUTH: {
    USER: "/api/auth/user",
    LOGOUT: "/api/auth/logout",
    DISCORD: "/api/auth/discord",
  },
  MODS: {
    LIST: "/api/mods",
    DETAILS: (id: number) => `/api/mods/${id}`,
    VERSIONS: (id: number) => `/api/mods/${id}/versions`,
    REVIEWS: (id: number) => `/api/mods/${id}/reviews`,
    DOWNLOAD: (id: number) => `/api/mods/${id}/download`,
  },
  CART: {
    LIST: "/api/cart",
    ADD: "/api/cart",
    REMOVE: (modId: number) => `/api/cart/${modId}`,
    CLEAR: "/api/cart",
  },
  PAYMENT: {
    CREATE_INTENT: "/api/create-payment-intent",
    CREATE_SUBSCRIPTION: "/api/get-or-create-subscription",
    COMPLETE: "/api/purchase/complete",
  },
  MOD_LOCKER: "/api/mod-locker",
  FORUM: {
    CATEGORIES: "/api/forum/categories",
    THREADS: (categoryId: number) => `/api/forum/categories/${categoryId}/threads`,
    THREAD: (id: number) => `/api/forum/threads/${id}`,
    REPLIES: (threadId: number) => `/api/forum/threads/${threadId}/replies`,
  },
};

// Mod categories
export const MOD_CATEGORIES = [
  { id: "sports", name: "Sports Cars", count: 36 },
  { id: "offroad", name: "Off-Road", count: 28 },
  { id: "classic", name: "Classics", count: 25 },
  { id: "trucks", name: "Trucks & SUVs", count: 31 },
  { id: "racing", name: "Racing", count: 22 },
  { id: "electric", name: "Electric", count: 14 },
  { id: "motorcycle", name: "Motorcycles", count: 18 },
  { id: "parts", name: "Parts & Accessories", count: 45 },
];

// Site statistics (for home page)
export const SITE_STATS = {
  MODS: "120+",
  DOWNLOADS: "50K+",
  USERS: "25K+",
  RATING: "4.9/5",
};

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Color palette
export const COLORS = {
  PRIMARY: "#7300ff",
  PRIMARY_LIGHT: "#8b1aff",
  PRIMARY_DARK: "#5c00cc",
  SECONDARY: "#00e5ff",
  SECONDARY_LIGHT: "#33eaff",
  SECONDARY_DARK: "#00b3cc",
  DARK: "#121214",
  DARK_LIGHTER: "#1a1a1f",
  DARK_CARD: "#2d2d3a",
  NEUTRAL: "#8888a2",
  NEUTRAL_LIGHT: "#aaaabf",
  NEUTRAL_DARK: "#666680",
  SUCCESS: "#11ff00",
  ERROR: "#ff3e00",
};

// Animation variants for Framer Motion
export const ANIMATIONS = {
  FADE_IN: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  SLIDE_UP: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
  SLIDE_RIGHT: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  },
  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  },
  STAGGER_CHILDREN: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
