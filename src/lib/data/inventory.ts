import { InventoryItem } from '@/types/onx';

const tenantId = 'juniper_001';

// All SKUs with inventory across warehouses
const skuInventory: Record<string, Record<string, { onHand: number; unavailable: number }>> = {
  // Trail Runner Pro
  'TRP-08': { WH001: { onHand: 24, unavailable: 2 }, WH002: { onHand: 18, unavailable: 0 }, WH003: { onHand: 10, unavailable: 1 } },
  'TRP-09': { WH001: { onHand: 31, unavailable: 1 }, WH002: { onHand: 22, unavailable: 2 }, WH003: { onHand: 15, unavailable: 0 } },
  'TRP-10': { WH001: { onHand: 45, unavailable: 3 }, WH002: { onHand: 38, unavailable: 2 }, WH003: { onHand: 20, unavailable: 1 } },
  'TRP-11': { WH001: { onHand: 28, unavailable: 1 }, WH002: { onHand: 19, unavailable: 0 }, WH003: { onHand: 12, unavailable: 2 } },
  'TRP-12': { WH001: { onHand: 17, unavailable: 0 }, WH002: { onHand: 14, unavailable: 1 }, WH003: { onHand: 8, unavailable: 0 } },
  // Approach Shoe
  'APS-08': { WH001: { onHand: 18, unavailable: 1 }, WH002: { onHand: 12, unavailable: 0 }, WH003: { onHand: 8, unavailable: 0 } },
  'APS-09': { WH001: { onHand: 22, unavailable: 0 }, WH002: { onHand: 16, unavailable: 1 }, WH003: { onHand: 10, unavailable: 0 } },
  'APS-10': { WH001: { onHand: 35, unavailable: 2 }, WH002: { onHand: 28, unavailable: 1 }, WH003: { onHand: 14, unavailable: 0 } },
  'APS-11': { WH001: { onHand: 20, unavailable: 0 }, WH002: { onHand: 15, unavailable: 0 }, WH003: { onHand: 9, unavailable: 1 } },
  'APS-12': { WH001: { onHand: 12, unavailable: 1 }, WH002: { onHand: 10, unavailable: 0 }, WH003: { onHand: 5, unavailable: 0 } },
  // Waterproof Boot
  'WPB-08': { WH001: { onHand: 14, unavailable: 0 }, WH002: { onHand: 10, unavailable: 1 }, WH003: { onHand: 6, unavailable: 0 } },
  'WPB-09': { WH001: { onHand: 19, unavailable: 1 }, WH002: { onHand: 15, unavailable: 0 }, WH003: { onHand: 8, unavailable: 0 } },
  'WPB-10': { WH001: { onHand: 24, unavailable: 2 }, WH002: { onHand: 18, unavailable: 1 }, WH003: { onHand: 11, unavailable: 0 } },
  'WPB-11': { WH001: { onHand: 17, unavailable: 0 }, WH002: { onHand: 13, unavailable: 0 }, WH003: { onHand: 7, unavailable: 1 } },
  'WPB-12': { WH001: { onHand: 10, unavailable: 0 }, WH002: { onHand: 8, unavailable: 1 }, WH003: { onHand: 4, unavailable: 0 } },
  // Summit Pack 45L
  'SP45-AG': { WH001: { onHand: 35, unavailable: 5 }, WH002: { onHand: 28, unavailable: 0 }, WH003: { onHand: 15, unavailable: 2 } },
  'SP45-SG': { WH001: { onHand: 29, unavailable: 3 }, WH002: { onHand: 24, unavailable: 1 }, WH003: { onHand: 12, unavailable: 0 } },
  // Day Pack 22L
  'DP22-SB': { WH001: { onHand: 40, unavailable: 2 }, WH002: { onHand: 30, unavailable: 1 }, WH003: { onHand: 18, unavailable: 0 } },
  'DP22-GR': { WH001: { onHand: 35, unavailable: 1 }, WH002: { onHand: 28, unavailable: 0 }, WH003: { onHand: 16, unavailable: 1 } },
  'DP22-SO': { WH001: { onHand: 22, unavailable: 0 }, WH002: { onHand: 18, unavailable: 2 }, WH003: { onHand: 10, unavailable: 0 } },
  // Duffel 60L
  'DFL-BK': { WH001: { onHand: 28, unavailable: 1 }, WH002: { onHand: 22, unavailable: 0 }, WH003: { onHand: 12, unavailable: 0 } },
  'DFL-NV': { WH001: { onHand: 20, unavailable: 0 }, WH002: { onHand: 16, unavailable: 1 }, WH003: { onHand: 9, unavailable: 0 } },
  'DFL-OL': { WH001: { onHand: 15, unavailable: 2 }, WH002: { onHand: 12, unavailable: 0 }, WH003: { onHand: 7, unavailable: 0 } },
  // Waist Pack
  'WP5-BK': { WH001: { onHand: 55, unavailable: 3 }, WH002: { onHand: 40, unavailable: 2 }, WH003: { onHand: 25, unavailable: 0 } },
  'WP5-TL': { WH001: { onHand: 42, unavailable: 1 }, WH002: { onHand: 32, unavailable: 0 }, WH003: { onHand: 20, unavailable: 1 } },
  // Alpine Shelter 2P
  'AS2P-STD': { WH001: { onHand: 18, unavailable: 1 }, WH002: { onHand: 12, unavailable: 0 }, WH003: { onHand: 7, unavailable: 1 } },
  // Basecamp Tent 4P
  'BCT4-FR': { WH001: { onHand: 22, unavailable: 1 }, WH002: { onHand: 16, unavailable: 0 }, WH003: { onHand: 9, unavailable: 0 } },
  'BCT4-SD': { WH001: { onHand: 18, unavailable: 0 }, WH002: { onHand: 14, unavailable: 1 }, WH003: { onHand: 7, unavailable: 0 } },
  // Ridgeline Jacket
  'RJ-XS': { WH001: { onHand: 12, unavailable: 0 }, WH002: { onHand: 8, unavailable: 1 }, WH003: { onHand: 5, unavailable: 0 } },
  'RJ-S':  { WH001: { onHand: 22, unavailable: 1 }, WH002: { onHand: 18, unavailable: 0 }, WH003: { onHand: 9, unavailable: 1 } },
  'RJ-M':  { WH001: { onHand: 35, unavailable: 2 }, WH002: { onHand: 28, unavailable: 1 }, WH003: { onHand: 16, unavailable: 0 } },
  'RJ-L':  { WH001: { onHand: 30, unavailable: 1 }, WH002: { onHand: 25, unavailable: 2 }, WH003: { onHand: 13, unavailable: 1 } },
  'RJ-XL': { WH001: { onHand: 19, unavailable: 0 }, WH002: { onHand: 15, unavailable: 1 }, WH003: { onHand: 8, unavailable: 0 } },
  // Merino Base Layer
  'MBL-XS': { WH001: { onHand: 20, unavailable: 0 }, WH002: { onHand: 15, unavailable: 1 }, WH003: { onHand: 8, unavailable: 0 } },
  'MBL-S':  { WH001: { onHand: 28, unavailable: 1 }, WH002: { onHand: 22, unavailable: 0 }, WH003: { onHand: 12, unavailable: 0 } },
  'MBL-M':  { WH001: { onHand: 40, unavailable: 2 }, WH002: { onHand: 32, unavailable: 1 }, WH003: { onHand: 18, unavailable: 0 } },
  'MBL-L':  { WH001: { onHand: 35, unavailable: 1 }, WH002: { onHand: 28, unavailable: 0 }, WH003: { onHand: 15, unavailable: 1 } },
  'MBL-XL': { WH001: { onHand: 22, unavailable: 0 }, WH002: { onHand: 18, unavailable: 1 }, WH003: { onHand: 10, unavailable: 0 } },
  // Softshell Vest
  'SSV-XS': { WH001: { onHand: 16, unavailable: 0 }, WH002: { onHand: 12, unavailable: 0 }, WH003: { onHand: 6, unavailable: 1 } },
  'SSV-S':  { WH001: { onHand: 24, unavailable: 1 }, WH002: { onHand: 18, unavailable: 0 }, WH003: { onHand: 10, unavailable: 0 } },
  'SSV-M':  { WH001: { onHand: 32, unavailable: 2 }, WH002: { onHand: 26, unavailable: 1 }, WH003: { onHand: 14, unavailable: 0 } },
  'SSV-L':  { WH001: { onHand: 28, unavailable: 0 }, WH002: { onHand: 22, unavailable: 1 }, WH003: { onHand: 12, unavailable: 0 } },
  'SSV-XL': { WH001: { onHand: 18, unavailable: 1 }, WH002: { onHand: 14, unavailable: 0 }, WH003: { onHand: 8, unavailable: 0 } },
  // Rain Shell
  'RS-XS': { WH001: { onHand: 14, unavailable: 0 }, WH002: { onHand: 10, unavailable: 0 }, WH003: { onHand: 6, unavailable: 0 } },
  'RS-S':  { WH001: { onHand: 20, unavailable: 1 }, WH002: { onHand: 16, unavailable: 0 }, WH003: { onHand: 9, unavailable: 0 } },
  'RS-M':  { WH001: { onHand: 30, unavailable: 2 }, WH002: { onHand: 24, unavailable: 1 }, WH003: { onHand: 13, unavailable: 0 } },
  'RS-L':  { WH001: { onHand: 26, unavailable: 1 }, WH002: { onHand: 20, unavailable: 0 }, WH003: { onHand: 11, unavailable: 1 } },
  'RS-XL': { WH001: { onHand: 16, unavailable: 0 }, WH002: { onHand: 12, unavailable: 1 }, WH003: { onHand: 7, unavailable: 0 } },
  // Hydration Flask 32oz
  'HF32-SB': { WH001: { onHand: 80, unavailable: 5 }, WH002: { onHand: 65, unavailable: 3 }, WH003: { onHand: 40, unavailable: 2 } },
  'HF32-FG': { WH001: { onHand: 72, unavailable: 4 }, WH002: { onHand: 58, unavailable: 2 }, WH003: { onHand: 35, unavailable: 1 } },
  'HF32-ER': { WH001: { onHand: 68, unavailable: 3 }, WH002: { onHand: 54, unavailable: 2 }, WH003: { onHand: 30, unavailable: 1 } },
  // Trekking Poles
  'TKP-STD': { WH001: { onHand: 30, unavailable: 1 }, WH002: { onHand: 24, unavailable: 0 }, WH003: { onHand: 14, unavailable: 0 } },
  'TKP-WMN': { WH001: { onHand: 24, unavailable: 0 }, WH002: { onHand: 18, unavailable: 1 }, WH003: { onHand: 10, unavailable: 0 } },
  // Headlamp
  'HL350-BK': { WH001: { onHand: 60, unavailable: 3 }, WH002: { onHand: 48, unavailable: 2 }, WH003: { onHand: 28, unavailable: 1 } },
  'HL350-TL': { WH001: { onHand: 42, unavailable: 2 }, WH002: { onHand: 34, unavailable: 1 }, WH003: { onHand: 20, unavailable: 0 } },
  // Camp Stove
  'CS-STD': { WH001: { onHand: 35, unavailable: 1 }, WH002: { onHand: 28, unavailable: 0 }, WH003: { onHand: 16, unavailable: 0 } },
  'CS-BDL': { WH001: { onHand: 22, unavailable: 0 }, WH002: { onHand: 18, unavailable: 1 }, WH003: { onHand: 10, unavailable: 0 } },
  // Basecamp Sleeping Bag
  'BSB-15F': { WH001: { onHand: 25, unavailable: 2 }, WH002: { onHand: 20, unavailable: 0 }, WH003: { onHand: 11, unavailable: 1 } },
  'BSB-30F': { WH001: { onHand: 32, unavailable: 1 }, WH002: { onHand: 27, unavailable: 2 }, WH003: { onHand: 14, unavailable: 0 } },
  // River Hiking Sandal
  'RHS-08': { WH001: { onHand: 20, unavailable: 1 }, WH002: { onHand: 15, unavailable: 0 }, WH003: { onHand: 10, unavailable: 0 } },
  'RHS-09': { WH001: { onHand: 25, unavailable: 0 }, WH002: { onHand: 18, unavailable: 1 }, WH003: { onHand: 12, unavailable: 0 } },
  'RHS-10': { WH001: { onHand: 30, unavailable: 2 }, WH002: { onHand: 22, unavailable: 0 }, WH003: { onHand: 15, unavailable: 1 } },
  'RHS-11': { WH001: { onHand: 22, unavailable: 0 }, WH002: { onHand: 16, unavailable: 1 }, WH003: { onHand: 10, unavailable: 0 } },
  'RHS-12': { WH001: { onHand: 14, unavailable: 1 }, WH002: { onHand: 10, unavailable: 0 }, WH003: { onHand: 6, unavailable: 0 } },
  // Ultralight Hammock
  'ULH-FG': { WH001: { onHand: 35, unavailable: 2 }, WH002: { onHand: 28, unavailable: 1 }, WH003: { onHand: 18, unavailable: 0 } },
  'ULH-SB': { WH001: { onHand: 28, unavailable: 1 }, WH002: { onHand: 22, unavailable: 0 }, WH003: { onHand: 14, unavailable: 1 } },
  // Down Insulated Jacket
  'DIJ-XS': { WH001: { onHand: 10, unavailable: 0 }, WH002: { onHand: 8, unavailable: 0 }, WH003: { onHand: 5, unavailable: 0 } },
  'DIJ-S':  { WH001: { onHand: 18, unavailable: 1 }, WH002: { onHand: 14, unavailable: 0 }, WH003: { onHand: 8, unavailable: 0 } },
  'DIJ-M':  { WH001: { onHand: 28, unavailable: 2 }, WH002: { onHand: 22, unavailable: 1 }, WH003: { onHand: 14, unavailable: 0 } },
  'DIJ-L':  { WH001: { onHand: 24, unavailable: 1 }, WH002: { onHand: 20, unavailable: 0 }, WH003: { onHand: 12, unavailable: 1 } },
  'DIJ-XL': { WH001: { onHand: 15, unavailable: 0 }, WH002: { onHand: 12, unavailable: 1 }, WH003: { onHand: 7, unavailable: 0 } },
  // Stretch Hiking Pants
  'SHP-S':  { WH001: { onHand: 20, unavailable: 1 }, WH002: { onHand: 16, unavailable: 0 }, WH003: { onHand: 10, unavailable: 0 } },
  'SHP-M':  { WH001: { onHand: 30, unavailable: 2 }, WH002: { onHand: 24, unavailable: 1 }, WH003: { onHand: 15, unavailable: 0 } },
  'SHP-L':  { WH001: { onHand: 26, unavailable: 1 }, WH002: { onHand: 20, unavailable: 0 }, WH003: { onHand: 12, unavailable: 1 } },
  'SHP-XL': { WH001: { onHand: 16, unavailable: 0 }, WH002: { onHand: 12, unavailable: 1 }, WH003: { onHand: 8, unavailable: 0 } },
  // Wilderness First Aid Kit
  'FAK-DT': { WH001: { onHand: 50, unavailable: 3 }, WH002: { onHand: 40, unavailable: 2 }, WH003: { onHand: 25, unavailable: 1 } },
  'FAK-EX': { WH001: { onHand: 30, unavailable: 1 }, WH002: { onHand: 24, unavailable: 0 }, WH003: { onHand: 15, unavailable: 0 } },
  // Insulated Sleeping Pad
  'ISP-REG': { WH001: { onHand: 22, unavailable: 1 }, WH002: { onHand: 18, unavailable: 0 }, WH003: { onHand: 10, unavailable: 0 } },
  'ISP-LNG': { WH001: { onHand: 16, unavailable: 0 }, WH002: { onHand: 12, unavailable: 1 }, WH003: { onHand: 8, unavailable: 0 } },
};

function buildInventoryItems(): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const [sku, warehouses] of Object.entries(skuInventory)) {
    for (const [locationId, stock] of Object.entries(warehouses)) {
      items.push({
        tenantId,
        sku,
        locationId,
        onHand: stock.onHand,
        unavailable: stock.unavailable,
        available: stock.onHand - stock.unavailable,
      });
    }
  }
  return items;
}

let inventoryStore = buildInventoryItems();

export function getInventory(): InventoryItem[] { return [...inventoryStore]; }
export function getInventoryBySku(sku: string): InventoryItem[] {
  return inventoryStore.filter(i => i.sku === sku);
}
export function getTotalAvailableBySku(sku: string): number {
  return inventoryStore
    .filter(i => i.sku === sku)
    .reduce((sum, i) => sum + i.available, 0);
}

export function getInventorySummary(): Array<{ sku: string; totalAvailable: number; totalOnHand: number }> {
  const skus = [...new Set(inventoryStore.map(i => i.sku))];
  return skus.map(sku => {
    const items = inventoryStore.filter(i => i.sku === sku);
    return {
      sku,
      totalAvailable: items.reduce((s, i) => s + i.available, 0),
      totalOnHand: items.reduce((s, i) => s + (i.onHand ?? 0), 0),
    };
  });
}
