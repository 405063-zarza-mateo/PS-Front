import { UserDto } from "./userDto";

export interface Teacher{
    id : number;
    name : string;
    lastName : string;
    course : string;
    user : UserDto;
    assistance : number;

}