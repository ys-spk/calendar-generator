declare module 'date-holidays-parser' {
  export namespace HolidaysTypes {
    export interface Holiday {
      date: string;
      /** 通常は解決済みの文字列だが、言語解決に失敗するとロケール別マップが返りうる */
      name: string | Record<string, string>;
      type: string;
    }
  }

  export default class Holidays {
    constructor(data: object, country: string);
    getHolidays(year?: string | number | Date, lang?: string): HolidaysTypes.Holiday[];
  }
}
