export const env = {
  MAPBOX_TOKEN: import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN,
  CORE_API_URL:
    import.meta.env.VITE_CORE_API_URL || 'https://core.sentinels.pro/api/v1'
};
