export type ProjectStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Active"
  | "Completed"
  | "Rejected"
  | "Archived";

export type Visibility =
  | "Private"
  | "Public";

export interface ResearchProject {

  id:string;

  owner_id:string;

  university_id:string | null;

  title:string;

  abstract:string | null;

  research_area:string | null;

  country:string | null;

  keywords:string[];

  visibility:Visibility;

  ethics_status:string;

  funding_needed:number;

  funding_received:number;

  progress:number;

  status:ProjectStatus;

  start_date:string | null;

  end_date:string | null;

  file_url:string | null;

  metadata:any;

  created_at:string;

  updated_at:string;

}