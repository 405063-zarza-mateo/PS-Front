import { Results } from "./results";
import { Teacher } from "./teacher";

export interface Review {
    id : number;
    results : Results[];
    teacher : Teacher;
    date : Date;  
}