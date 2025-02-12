export interface ICFRReference {
  title: number;
  chapter: string;
}

export interface IAgencyBase {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
}

export interface IAgencyChild extends IAgencyBase {
  cfr_references?: ICFRReference[];
}

export interface IAgency extends IAgencyBase {
  children?: IAgencyChild[];
}

export interface IDatePill {
  id: string;
  date: Date;
}
