import { defineStore } from 'pinia';
import type { VendorPayment } from '@/types/vendorPayment';
import { parseCSV } from '@/services/csvService';


export interface DashboardState {
    loading: boolean;
    initialized: boolean;
    error: string | null;

    // Aggregates
    totalSpend: number;
    totalRecords: number;

    agencyTotals: Record<string, number>;
    categoryTotals: Record<string, number>;
    vendorTotals: Record<string, number>;
    monthlyTotals: Record<string, number>; // Key: "YYYY-MM"

    // Filter Options (Unique values)
    agencies: Set<string>;
    categories: Set<string>;
    vendors: Set<string>;
    subCategories: Set<string>;

    // Grouped Data for table
    groupedRows: Array<{
        agency: string;
        category: string;
        vendorCount: number;
        amount: number;
        vendors: Array<{ name: string, amount: number }>;
    }>;

    // Cached sorted lists for UI performance
    sortedAgencies: string[];
    sortedCategories: string[];
    sortedVendors: string[];

    // Active Filters
    filters: {
        agency: string[];
        category: string[];
        vendor: string[];
        month: string[];
        minAmount: number | null;
        maxAmount: number | null;
    };
}

export const useDashboardStore = defineStore('dashboard', {
    state: (): DashboardState => ({
        loading: false,
        initialized: false,
        error: null,

        totalSpend: 0,
        totalRecords: 0,

        agencyTotals: {},
        categoryTotals: {},
        vendorTotals: {},
        monthlyTotals: {},

        agencies: new Set(),
        categories: new Set(),
        vendors: new Set(),
        subCategories: new Set(),

        groupedRows: [],

        filters: {
            agency: [],
            category: [],
            vendor: [],
            month: [],
            minAmount: null,
            maxAmount: null
        },

        // Cached sorted lists for UI performance
        sortedAgencies: [] as string[],
        sortedCategories: [] as string[],
        sortedVendors: [] as string[]
    }),
    getters: {
        // Getters now just return the cached lists
        agencyOptions: (state) => state.sortedAgencies,
        categoryOptions: (state) => state.sortedCategories,
        vendorOptions: (state) => state.sortedVendors,
        agencyChartData: (state) => {
            return Object.entries(state.agencyTotals)
                .map(([name, total]) => ({ name, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
        },
        categoryChartData: (state) => {
            return Object.entries(state.categoryTotals)
                .map(([name, total]) => ({ name, total }))
                .sort((a, b) => b.total - a.total);
        }
    },
    actions: {
        setLoading(val: boolean) {
            this.loading = val;
        },
        setError(msg: string | null) {
            this.error = msg;
        },
        clearError() {
            this.error = null;
        },
        addRecord(row: any) {
            this.addRecords([row]);
        },
        addRecords(rows: any[]) {
            // Internal counters to avoid repeated state lookups if needed
            let batchSpend = 0;
            let batchCount = 0;

            for (const row of rows) {
                const amount = typeof row.Amount === 'number'
                    ? row.Amount
                    : parseFloat(String(row.Amount || '0').replace(/[$,]/g, ''));

                if (isNaN(amount)) continue;

                batchSpend += amount;
                batchCount += 1;

                // Normalize names
                const agency = (row.Agency || 'Unknown').trim();
                const category = (row.Category || 'Unknown').trim();
                const vendor = (row.Vendor || 'Unknown').trim();
                const subCat = (row.SubCategory || 'Unknown').trim();

                const fy = typeof row.FY === 'number' ? row.FY : parseInt(row.FY);
                const fMonth = typeof row.FMonth === 'number' ? row.FMonth : parseInt(row.FMonth);
                const monthKey = `${fy}-${String(fMonth).padStart(2, '0')}`;

                // Update Groups
                this.agencyTotals[agency] = (this.agencyTotals[agency] || 0) + amount;
                this.categoryTotals[category] = (this.categoryTotals[category] || 0) + amount;
                this.vendorTotals[vendor] = (this.vendorTotals[vendor] || 0) + amount;
                this.monthlyTotals[monthKey] = (this.monthlyTotals[monthKey] || 0) + amount;

                // Collect Unique Values for Filters
                this.agencies.add(agency);
                this.categories.add(category);
                this.vendors.add(vendor);
                this.subCategories.add(subCat);
            }
            this.totalSpend += batchSpend;
            this.totalRecords += batchCount;
        },
        patchData(data: any) {
            this.totalSpend = data.totalSpend;
            this.totalRecords = data.totalRecords;
            this.agencyTotals = { ...data.agencyTotals };
            this.categoryTotals = { ...data.categoryTotals };
            this.vendorTotals = { ...data.vendorTotals };
            this.monthlyTotals = { ...data.monthlyTotals };
            this.groupedRows = [...data.groupedRows];

            // Only update sets if they have grown
            if (data.agencies.size > this.agencies.size) {
                this.agencies = new Set(data.agencies);
                this.categories = new Set(data.categories);
                this.vendors = new Set(data.vendors);
                this.subCategories = new Set(data.subCategories);

                // Update cached sorted lists
                this.sortedAgencies = Array.from(this.agencies).sort();
                this.sortedCategories = Array.from(this.categories).sort();
                this.sortedVendors = Array.from(this.vendors).sort();
            }
        },
        resetData(keepOptions: boolean = false) {
            this.totalSpend = 0;
            this.totalRecords = 0;
            this.agencyTotals = {};
            this.categoryTotals = {};
            this.vendorTotals = {};
            this.monthlyTotals = {};
            this.groupedRows = [];

            if (!keepOptions) {
                this.agencies.clear();
                this.categories.clear();
                this.vendors.clear();
                this.subCategories.clear();
                this.sortedAgencies = [];
                this.sortedCategories = [];
                this.sortedVendors = [];
            }
        },
        resetFilters() {
            this.filters.agency = [];
            this.filters.category = [];
            this.filters.vendor = [];
        },
        resetAllAndParse() {
            this.resetFilters();
            this.resetData(true);
            parseCSV();
        }
    }
});
