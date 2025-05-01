import { ResultDto } from "./ResultDto";

export interface TeacherReviewDto {
    reviewId : number;
    results : ResultDto[];
    date : Date;
    studentName : String;
    studentLastName : String;
    course : String;
}