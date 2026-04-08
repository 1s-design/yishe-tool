export interface ProjectConfig {
  rootUrl: string;
  h5QrcodeHref: string;
  icp: {
    text: string;
    link: string;
  };
  homepageContratUsLinks: Record<string, any>;
}

const trimText = (value: unknown, fallback = "") => {
  const normalized = String(value || "").trim();
  return normalized || fallback;
};

const runtimeOrigin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "";

export const publicAppConfig = {
  appName: trimText(import.meta.env.VITE_APP_NAME, "Design Tool"),
  shortName: trimText(import.meta.env.VITE_APP_SHORT_NAME, "Design Tool"),
  adminTitle: trimText(import.meta.env.VITE_ADMIN_TITLE, "Design Tool Console"),
  publicOrigin: trimText(import.meta.env.VITE_PUBLIC_ORIGIN, runtimeOrigin),
  shareWatermark: trimText(
    import.meta.env.VITE_SHARE_WATERMARK,
    "Designed with Design Tool",
  ),
  defaultQrCodeContent: trimText(
    import.meta.env.VITE_DEFAULT_QRCODE_CONTENT,
    runtimeOrigin || "https://example.com",
  ),
};

export const resolvePublicOrigin = (preferredOrigin?: unknown) => {
  const normalized = trimText(preferredOrigin);
  if (normalized) {
    return normalized.replace(/\/+$/, "");
  }
  return trimText(publicAppConfig.publicOrigin).replace(/\/+$/, "");
};

export const createPreviewShareLink = (id: string | number) => {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) {
    return "";
  }

  const baseOrigin = resolvePublicOrigin();
  const sharePath = `/#/preview?id=${encodeURIComponent(normalizedId)}&timestamp=${Date.now()}`;
  return baseOrigin ? `${baseOrigin}${sharePath}` : sharePath;
};

export const createDefaultProjectConfig = (): ProjectConfig => {
  const origin = resolvePublicOrigin();
  return {
    rootUrl: origin,
    h5QrcodeHref: origin,
    icp: {
      text: "",
      link: "",
    },
    homepageContratUsLinks: {},
  };
};

export const normalizeProjectConfig = (value: unknown): ProjectConfig => {
  const defaults = createDefaultProjectConfig();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }

  const raw = value as Record<string, any>;
  const normalizedRootUrl = trimText(raw.rootUrl, defaults.rootUrl);
  const normalizedH5QrcodeHref = trimText(
    raw.h5QrcodeHref,
    normalizedRootUrl || defaults.h5QrcodeHref,
  );

  return {
    rootUrl: normalizedRootUrl,
    h5QrcodeHref: normalizedH5QrcodeHref,
    icp: {
      text: trimText(raw.icp?.text),
      link: trimText(raw.icp?.link),
    },
    homepageContratUsLinks:
      raw.homepageContratUsLinks &&
      typeof raw.homepageContratUsLinks === "object" &&
      !Array.isArray(raw.homepageContratUsLinks)
        ? raw.homepageContratUsLinks
        : {},
  };
};
