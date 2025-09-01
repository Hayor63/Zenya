export const formatResponseRecord: (record: any, recordType?: any) => any = (
    record,
    recordType
  ) => {
    if (typeof record !== "object" || !record) {
      return record;
    }
    if (record instanceof Date) {
      return record;
    }
  
    const strippedUnderscoreRecord: Record<string, any> = Object.keys(
      record
    ).reduce((acc, key) => {
      if (
        typeof record[key] === "object" &&
        record[key] !== null &&
        !/^_/.test(key)
      ) {
        if (Array.isArray(record[key])) {
          return {
            ...acc,
            [key]: record[key].map((record: any) => formatResponseRecord(record)),
          };
        }
        return { ...acc, [key]: formatResponseRecord(record[key]) };
      }
      // Omit fields that start with underscore
      return /^_/.test(key) ? acc : { ...acc, [key]: record[key] };
    }, {});
  
    strippedUnderscoreRecord.id = record._id || record.id;
    switch (recordType) {
      case "addonGroup":
        return {
          ...strippedUnderscoreRecord,
          addons: strippedUnderscoreRecord.addons?.sort(
            (a: any, b: any) => a.order - b.order
          ),
        };
      case "product":
        return {
          ...strippedUnderscoreRecord,
          variants: strippedUnderscoreRecord.variants?.sort(
            (a: any, b: any) => a.price - b.price
          ),
        };
      default:
        return strippedUnderscoreRecord;
    }
  };