declare module 'date-holidays-parser' {
  export namespace HolidaysTypes {
    export interface Holiday {
      date: string;
      name: string;
      type: string;
    }
  }

  export default class Holidays {
    constructor(data: object, country: string);
    getHolidays(year?: string | number | Date, lang?: string): HolidaysTypes.Holiday[];
  }
}
