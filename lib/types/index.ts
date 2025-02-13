export interface ICFRReference {
  title: number;
  chapter?: string;
  subtitle?: string;
}

export interface IAgencyBase {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  cfr_references?: ICFRReference[];
}

export interface IAgency extends IAgencyBase {
  children?: IAgencyBase[];
}

export interface IDatePill {
  id: string;
  date: Date;
}

export interface IRegsByDate {
  date: string;
  cfrReference: ICFRReference;
  regs: {
    wordCount: number;
    [key: string]: any;
  };
}

export interface IChartData {
  date: string;
  [agencyName: string]: number | string;
}
