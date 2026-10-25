
import axios from "axios";

const PAGE_SIZE = 12;
const FACEBOOK_PAGE_LIMIT = 100;
const MAX_PHOTOS = 1000;
const CACHE_DURATION = 5 * 60 * 1000;

let cachedPhotos = null;
let cacheTime = 0;

// Fetch all available Page photos from Facebook.
const fetchFacebookPhotos = async () => {
  const {
    META_GRAPH_API_VERSION,
    FACEBOOK_PAGE_ID,
    FACEBOOK_PAGE_ACCESS_TOKEN,
  } = process.env;

  // Validate configuration.
  if (
    !META_GRAPH_API_VERSION ||
    !FACEBOOK_PAGE_ID ||
    !FACEBOOK_PAGE_ACCESS_TOKEN
  ) {
    throw new Error(
      "Missing environment variables: META_GRAPH_API_VERSION, FACEBOOK_PAGE_ID, or FACEBOOK_PAGE_ACCESS_TOKEN."
    );
  }

  const url =
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/` +
    `${FACEBOOK_PAGE_ID}/photos`;

  const photos = [];
  const seenIds = new Set();
  let after = null;

  while (photos.length < MAX_PHOTOS) {
    const params = {
      fields: "id,name,images,link,created_time",
      limit: Math.min(
        FACEBOOK_PAGE_LIMIT,
        MAX_PHOTOS - photos.length
      ),
      access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    };

    if (after) {
      params.after = after;
    }

    const response = await axios.get(url, {
      params,
      timeout: 20000,
    });

    const pagePhotos = response.data?.data ?? [];

    for (const photo of pagePhotos) {
      if (!photo.id || seenIds.has(photo.id)) {
        continue;
      }

      const imageUrl = photo.images?.[0]?.source;

      if (!imageUrl) {
        continue;
      }

      seenIds.add(photo.id);

      photos.push({
        id: photo.id,
        caption: photo.name ?? "",
        imageUrl,
        facebookUrl: photo.link ?? "",
        createdAt: photo.created_time ?? null,
      });

      if (photos.length >= MAX_PHOTOS) {
        break;
      }
    }

    const nextAfter = response.data?.paging?.cursors?.after;

    if (
      !response.data?.paging?.next ||
      !nextAfter ||
      nextAfter === after ||
      pagePhotos.length === 0
    ) {
      break;
    }

    after = nextAfter;
  }

  // Sort by creation date, newest first.
  photos.sort((a, b) => {
    const dateA = Date.parse(a.createdAt ?? "") || 0;
    const dateB = Date.parse(b.createdAt ?? "") || 0;

    return dateB - dateA;
  });

  return photos;
};

// GET /api/v1/gallery/
export const getFacebookGallery = async (req, res) => {
  try {
    const parsedCursor = Number(req.query.cursor ?? 0);

    if (
      !Number.isSafeInteger(parsedCursor) ||
      parsedCursor < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cursor must be a non-negative integer.",
      });
    }

    // Refresh the cache when missing or expired.
    if (
      !cachedPhotos ||
      Date.now() - cacheTime >= CACHE_DURATION
    ) {
      console.log("Fetching photos from Facebook Graph API...");

      const latestPhotos = await fetchFacebookPhotos();

      cachedPhotos = latestPhotos;
      cacheTime = Date.now();

      console.log(
        `Facebook gallery updated. Photos found: ${cachedPhotos.length}`
      );
    }

    const cursor = parsedCursor;

    const photos = cachedPhotos.slice(
      cursor,
      cursor + PAGE_SIZE
    );

    const nextPosition = cursor + photos.length;
    const hasMore = nextPosition < cachedPhotos.length;

    return res.status(200).json({
      success: true,
      count: cachedPhotos.length,
      photos,
      nextCursor: hasMore ? String(nextPosition) : null,
      hasMore,
    });
  } catch (error) {
    // Log details on the backend, but never log the access token.
    console.error("Facebook Gallery Error:", {
      message: error.message,
      status: error.response?.status,
      facebookError: error.response?.data?.error
        ? {
            message: error.response.data.error.message,
            type: error.response.data.error.type,
            code: error.response.data.error.code,
            subcode: error.response.data.error.error_subcode,
          }
        : undefined,
    });

    return res.status(502).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to fetch Facebook gallery photos.",
    });
  }
};

// Optional: clear the cached gallery when needed.
export const clearGalleryCache = (req, res) => {
  cachedPhotos = null;
  cacheTime = 0;

  return res.status(200).json({
    success: true,
    message: "Gallery cache cleared.",
  });
};