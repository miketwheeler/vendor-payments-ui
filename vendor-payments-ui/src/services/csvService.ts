import Papa from 'papaparse';
import { useDashboardStore } from '@/stores/dashboardStore';

const csvPath = window.location.origin + '/payments.csv';

/**
 * Parses the CSV file using PapaParse with chunk processing for memory efficiency.
 * @param filters Optional filter object to apply during parsing
 * @returns A Promise that resolves when parsing is complete
 */
export const parseCSV = async (filters?: any) => {
    const store = useDashboardStore();
    store.setLoading(true);
    store.clearError();

    // Local non-reactive accumulators
    const localAgg = {
        totalSpend: 0,
        totalRecords: 0,
        agencyTotals: {} as Record<string, number>,
        categoryTotals: {} as Record<string, number>,
        vendorTotals: {} as Record<string, number>,
        monthlyTotals: {} as Record<string, number>,
        agencies: new Set<string>(),
        categories: new Set<string>(),
        vendors: new Set<string>(),
        subCategories: new Set<string>(),
        // Map for grouping: Key is "Agency|Category"
        groups: new Map<string, { agency: string, category: string, amount: number, vendorMap: Map<string, number> }>()
    };

    // console.log("Starting Grouped CSV parse for:", csvPath);

    return new Promise((resolve, reject) => {
        Papa.parse(csvPath, {
            download: true,
            header: true,
            dynamicTyping: false,
            skipEmptyLines: 'greedy',
            worker: true,
            chunkSize: 1024 * 1024 * 2, // 2MB chunks
            chunk: function (results: any) {
                const data = results.data;

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];

                    const rawAmount = String(row.Amount || '0').replace(/[$,]/g, '');
                    const amount = parseFloat(rawAmount) || 0;

                    // Quick filter check with trimming and sanitization
                    if (filters) {
                        const rowAgency = (row.Agency || '').trim();
                        const rowCategory = (row.Category || '').trim();
                        const rowVendorRaw = (row.Vendor || '').trim();

                        // Apply same sanitization as below for consistent filtering
                        const rowVendor = rowVendorRaw
                            .replace(/^#\s*\*\s*#\s*/, '')
                            .replace(/^[*]\s+/, '')
                            .replace(/\s{2,}/g, ' ')
                            .trim();

                        if (filters.agency?.length && !filters.agency.includes(rowAgency)) continue;
                        if (filters.category?.length && !filters.category.includes(rowCategory)) continue;
                        if (filters.vendor?.length && !filters.vendor.includes(rowVendor)) continue;

                        if (filters.minAmount !== null && amount < filters.minAmount) continue;
                        if (filters.maxAmount !== null && amount > filters.maxAmount) continue;
                    }

                    if (amount === 0 && !row.Agency) continue;

                    localAgg.totalSpend += amount;
                    localAgg.totalRecords++;

                    const agency = (row.Agency || 'Unknown').trim();
                    const category = (row.Category || 'Unknown').trim();
                    const rawVendor = (row.Vendor || 'Unknown').trim();

                    // Sanitize Vendor Name: Remove system noise like "# * # " or leading stars
                    const vendor = rawVendor
                        .replace(/^#\s*\*\s*#\s*/, '') // Remove "# * # "
                        .replace(/^[*]\s+/, '')         // Remove leading "* "
                        .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
                        .trim();

                    const subCat = (row.SubCategory || 'Unknown').trim();

                    localAgg.agencyTotals[agency] = (localAgg.agencyTotals[agency] || 0) + amount;
                    localAgg.categoryTotals[category] = (localAgg.categoryTotals[category] || 0) + amount;
                    localAgg.vendorTotals[vendor] = (localAgg.vendorTotals[vendor] || 0) + amount;

                    const monthKey = `${row.FY}-${row.FMonth}`;
                    localAgg.monthlyTotals[monthKey] = (localAgg.monthlyTotals[monthKey] || 0) + amount;

                    localAgg.agencies.add(agency);
                    localAgg.categories.add(category);
                    localAgg.vendors.add(vendor);
                    localAgg.subCategories.add(subCat);

                    // Grouping Logic
                    const groupKey = `${agency}|${category}`;
                    let group = localAgg.groups.get(groupKey);
                    if (!group) {
                        group = { agency, category, amount: 0, vendorMap: new Map<string, number>() };
                        localAgg.groups.set(groupKey, group);
                    }
                    group.amount += amount;

                    // Add vendor-specific total within this group
                    const currentVendorAmount = group.vendorMap.get(vendor) || 0;
                    group.vendorMap.set(vendor, currentVendorAmount + amount);
                }

                // Periodically update store if needed
                if (localAgg.totalRecords % 200000 === 0) {
                    const groupedRows = Array.from(localAgg.groups.values()).map(g => ({
                        agency: g.agency,
                        category: g.category,
                        vendorCount: g.vendorMap.size,
                        amount: g.amount,
                        vendors: Array.from(g.vendorMap.entries())
                            .map(([name, total]) => ({ name, amount: total }))
                            .sort((a, b) => b.amount - a.amount)
                    }));
                    store.patchData({ ...localAgg, groupedRows });
                }
            },
            complete: function () {
                const groupedRows = Array.from(localAgg.groups.values()).map(g => ({
                    agency: g.agency,
                    category: g.category,
                    vendorCount: g.vendorMap.size,
                    amount: g.amount,
                    vendors: Array.from(g.vendorMap.entries())
                        .map(([name, total]) => ({ name, amount: total }))
                        .sort((a, b) => b.amount - a.amount)
                }));
                store.patchData({ ...localAgg, groupedRows });
                store.setLoading(false);
                store.initialized = true;
                resolve(true);
                console.log("Grouped Parse Complete. Records:", localAgg.totalRecords);
            },
            error: function (error: any) {
                store.setError(`CSV Parse Error: ${error.message}`);
                store.setLoading(false);
                reject(error);
            }
        });
    });
}
