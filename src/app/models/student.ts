import { Review } from "./review";

export interface Student {
  id: number;
  name: string;
  lastName: string;
  gender: string;
  address: string;
  course: string;
  reviews : Review[];
  assistance: number;
  familyInfo : string;
}