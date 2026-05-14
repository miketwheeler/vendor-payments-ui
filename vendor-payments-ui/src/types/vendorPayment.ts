export interface VendorPayment {
    bien: string // 4-digit year (assumed origin year), followed by 2-digit end-year (e.g. "2021-23")
    fy: number // Fiscal year (e.g. "2022")
    fMonth: number // 2-digit fiscal month (e.g. "01")
    agy: number // 3-digit Agency number (e.g. "107")
    agency: string // Agency name
    object: string // single, capital letter used as assumed category code
    category: string
    subObj: string // 2-character, all cap
    subCategory: string
    vendor: string
    amount: number
}