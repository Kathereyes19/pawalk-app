/** Curated Unsplash photo IDs — production-safe hotlink URLs. */
export const IMAGE_POOLS = {
  'user-portrait': [
    'photo-1494790108377-be9c29b29330',
    'photo-1507003211169-0a1dd7228f2d',
    'photo-1438761681033-6461ffad8d80',
    'photo-1472099645785-5658abf4ff4e',
    'photo-1534528741775-53994a69daeb',
    'photo-1500648767791-00dcc994a43e',
  ],
  'pet-dog': [
    'photo-1587300003388-59208cc962cb',
    'photo-1548196847-dd394a3d3917',
    'photo-1530281700549-e025e9940186',
    'photo-1589948125163-e68fa770d137',
  ],
  'pet-cat': [
    'photo-1514888286974-6c13e2a660cc',
    'photo-1574158622682-40b711b76462',
    'photo-1494947660796-42d958bd8e94',
    'photo-1526336024174-e58f5cdd629e',
  ],
  'provider-walker': [
    'photo-1601758228041-f3b2795255f1',
    'photo-1548196847-dd394a3d3917',
    'photo-1583337130417-3346a7251ee6',
    'photo-1530281700549-e025e9940186',
  ],
  'provider-caregiver': [
    'photo-1583337130417-3346a7251ee6',
    'photo-1516734215756-9520068713a7',
    'photo-1601758228041-f3b2795255f1',
    'photo-1548196847-dd394a3d3917',
  ],
  'provider-veterinary': [
    'photo-1628007586309-a156e6084902',
    'photo-1576201836106-db1758fd1c10',
    'photo-1612536057812-932c6229d113',
  ],
  'provider-clinic': [
    'photo-1576201836106-db1758fd1c10',
    'photo-1612536057812-932c6229d113',
    'photo-1628007586309-a156e6084902',
    'photo-1516734215756-9520068713a7',
    'photo-1548196847-dd394a3d3917',
    'photo-1583337130417-3346a7251ee6',
  ],
  'pawalk-default': [
    'photo-1450778869180-41d060ad2f2d',
    'photo-1587300003388-59208cc962cb',
  ],
} as const;

export type ImageFallbackCategory = keyof typeof IMAGE_POOLS;
