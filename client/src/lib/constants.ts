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
    // Reviews system has been removed
    DOWNLOAD: (id: number) => `/api/mods/${id}/download`,
    // Removed TOGGLE_PUBLISH endpoint as publishing functionality has been removed
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
  // Forum system has been removed
};

// Mod categories (focused only on what JSD needs: cars, plushies, and rugs)
export const MOD_CATEGORIES = [
  { value: "vehicles", label: "Vehicles", id: "vehicles", name: "Vehicles", count: 0 },
  { value: "sports", label: "Sports Cars", id: "sports", name: "Sports Cars", count: 0 },
  { value: "drift", label: "Drift Cars", id: "drift", name: "Drift Cars", count: 0 },
  { value: "offroad", label: "Off-Road Vehicles", id: "offroad", name: "Off-Road Vehicles", count: 0 },
  { value: "racing", label: "Racing Cars", id: "racing", name: "Racing Cars", count: 0 },
  { value: "muscle", label: "Muscle Cars", id: "muscle", name: "Muscle Cars", count: 0 },
  { value: "jdm", label: "JDM Cars", id: "jdm", name: "JDM Cars", count: 0 },
  { value: "supercars", label: "Supercars", id: "supercars", name: "Supercars", count: 0 },
  { value: "custom", label: "Custom Builds", id: "custom", name: "Custom Builds", count: 0 },
  { value: "plushies", label: "Plushies", id: "plushies", name: "Plushies", count: 0 },
  { value: "rugs", label: "Rugs", id: "rugs", name: "Rugs", count: 0 },
];

// Site statistics (for home page) - these will be replaced by dynamic data from the admin panel
export const SITE_STATS = {
  MODS: "0",
  DOWNLOADS: "0",
  USERS: "0",
  RATING: "0.0/5",
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
