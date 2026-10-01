// get-fiscal-year doesn't export its country table. We read it directly (static data, so server and
// browser always show identical names — Intl.DisplayNames differs between Node and browsers).
declare module "get-fiscal-year/src/fiscal-data.js" {
  const fiscalData: {
    country: string;
    code: string;
    calendarYear: boolean;
    fiscalStart: string | null;
    fiscalEnd: string | null;
  }[];
  export default fiscalData;
}
