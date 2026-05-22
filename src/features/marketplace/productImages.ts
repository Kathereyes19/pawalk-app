import type { MarketplaceCategory, MarketplaceProduct } from '@/types';
import { buildUnsplashUrl, hashString } from '@/lib/images';

/** Curated Unsplash photo IDs mapped to product + category/tag queries */
const PRODUCT_PHOTOS: Record<string, { main: string; gallery: string[] }> = {
  mp_food_1: {
    main: 'photo-1589948125163-e68fa770d137',
    gallery: [
      'photo-1589948125163-e68fa770d137',
      'photo-1601758228041-f3b2795255f1',
      'photo-1548196847-dd394a3d3917',
    ],
  },
  mp_food_2: {
    main: 'photo-1601758228041-f3b2795255f1',
    gallery: [
      'photo-1601758228041-f3b2795255f1',
      'photo-1587300003388-59208cc962cb',
      'photo-1589948125163-e68fa770d137',
    ],
  },
  mp_food_3: {
    main: 'photo-1514888286974-6c13e2a660cc',
    gallery: [
      'photo-1514888286974-6c13e2a660cc',
      'photo-1574158622682-40b711b76462',
      'photo-1494947660796-42d958bd8e94',
    ],
  },
  mp_groom_1: {
    main: 'photo-1516734215756-9520068713a7',
    gallery: [
      'photo-1516734215756-9520068713a7',
      'photo-1548196847-dd394a3d3917',
      'photo-1583337130417-3346a7251ee6',
    ],
  },
  mp_groom_2: {
    main: 'photo-1548196847-dd394a3d3917',
    gallery: [
      'photo-1548196847-dd394a3d3917',
      'photo-1516734215756-9520068713a7',
      'photo-1583337130417-3346a7251ee6',
    ],
  },
  mp_toy_1: {
    main: 'photo-1530281700549-e025e9940186',
    gallery: [
      'photo-1530281700549-e025e9940186',
      'photo-1587300003388-59208cc962cb',
      'photo-1601758228041-f3b2795255f1',
    ],
  },
  mp_toy_2: {
    main: 'photo-1587300003388-59208cc962cb',
    gallery: [
      'photo-1587300003388-59208cc962cb',
      'photo-1530281700549-e025e9940186',
      'photo-1601758228041-f3b2795255f1',
    ],
  },
  mp_toy_3: {
    main: 'photo-1494947660796-42d958bd8e94',
    gallery: [
      'photo-1494947660796-42d958bd8e94',
      'photo-1574158622682-40b711b76462',
      'photo-1514888286974-6c13e2a660cc',
    ],
  },
  mp_vet_1: {
    main: 'photo-1628007586309-a156e6084902',
    gallery: [
      'photo-1628007586309-a156e6084902',
      'photo-1576201836106-db1758fd1c10',
      'photo-1583337130417-3346a7251ee6',
    ],
  },
  mp_vet_2: {
    main: 'photo-1576201836106-db1758fd1c10',
    gallery: [
      'photo-1576201836106-db1758fd1c10',
      'photo-1628007586309-a156e6084902',
      'photo-1612536057812-932c6229d113',
    ],
  },
  mp_svc_1: {
    main: 'photo-1516734215756-9520068713a7',
    gallery: [
      'photo-1516734215756-9520068713a7',
      'photo-1548196847-dd394a3d3917',
      'photo-1583337130417-3346a7251ee6',
    ],
  },
  mp_svc_2: {
    main: 'photo-1628007586309-a156e6084902',
    gallery: [
      'photo-1628007586309-a156e6084902',
      'photo-1576201836106-db1758fd1c10',
      'photo-1583337130417-3346a7251ee6',
    ],
  },
};

const CATEGORY_PHOTO_POOL: Record<MarketplaceCategory, string[]> = {
  food: [
    'photo-1589948125163-e68fa770d137',
    'photo-1601758228041-f3b2795255f1',
    'photo-1514888286974-6c13e2a660cc',
  ],
  grooming: [
    'photo-1516734215756-9520068713a7',
    'photo-1548196847-dd394a3d3917',
    'photo-1583337130417-3346a7251ee6',
  ],
  toys: [
    'photo-1530281700549-e025e9940186',
    'photo-1587300003388-59208cc962cb',
    'photo-1494947660796-42d958bd8e94',
  ],
  veterinary: [
    'photo-1628007586309-a156e6084902',
    'photo-1576201836106-db1758fd1c10',
    'photo-1612536057812-932c6229d113',
  ],
  services: [
    'photo-1516734215756-9520068713a7',
    'photo-1628007586309-a156e6084902',
    'photo-1548196847-dd394a3d3917',
  ],
};

const TAG_PHOTO_POOL: Record<string, string[]> = {
  perros: ['photo-1589948125163-e68fa770d137', 'photo-1530281700549-e025e9940186'],
  gatos: ['photo-1514888286974-6c13e2a660cc', 'photo-1494947660796-42d958bd8e94'],
  snacks: ['photo-1601758228041-f3b2795255f1'],
  salud: ['photo-1628007586309-a156e6084902'],
  aseo: ['photo-1516734215756-9520068713a7'],
  juguetes: ['photo-1530281700549-e025e9940186'],
};

function resolvePhotoSet(product: MarketplaceProduct): { main: string; gallery: string[] } {
  const mapped = PRODUCT_PHOTOS[product.id];
  if (mapped) return mapped;

  const tagPool = product.tags
    .map((tag) => TAG_PHOTO_POOL[tag.toLowerCase()])
    .find(Boolean);
  const pool = tagPool ?? CATEGORY_PHOTO_POOL[product.category];
  const index = hashString(product.id) % pool.length;
  const main = pool[index];
  const gallery = [main, pool[(index + 1) % pool.length], pool[(index + 2) % pool.length]];
  return { main, gallery };
}

export function buildProductImageUrl(photoId: string, width = 600, height = 450): string {
  return buildUnsplashUrl(photoId, width, height);
}

export function getProductImageUrl(
  product: MarketplaceProduct,
  size: 'card' | 'detail' | 'thumb' = 'card'
): string {
  if (product.imageUrl) return product.imageUrl;

  const dimensions =
    size === 'detail'
      ? { w: 800, h: 600 }
      : size === 'thumb'
        ? { w: 128, h: 128 }
        : { w: 600, h: 450 };

  const { main } = resolvePhotoSet(product);
  return buildProductImageUrl(main, dimensions.w, dimensions.h);
}

export function getProductGalleryUrls(product: MarketplaceProduct): string[] {
  const hasUrlGallery = product.gallery.some((item) => item.startsWith('http'));
  if (hasUrlGallery) return product.gallery;

  const { gallery } = resolvePhotoSet(product);
  return gallery.map((photoId, index) =>
    buildProductImageUrl(photoId, index === 0 ? 800 : 200, index === 0 ? 600 : 200)
  );
}

export function enrichMarketplaceProduct(product: MarketplaceProduct): MarketplaceProduct {
  const { main, gallery } = resolvePhotoSet(product);
  return {
    ...product,
    imageUrl: buildProductImageUrl(main, 600, 450),
    gallery: gallery.map((photoId, index) =>
      buildProductImageUrl(photoId, index === 0 ? 800 : 240, index === 0 ? 600 : 240)
    ),
  };
}

export function enrichMarketplaceProducts(products: MarketplaceProduct[]): MarketplaceProduct[] {
  return products.map(enrichMarketplaceProduct);
}
