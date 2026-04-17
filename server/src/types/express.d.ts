import { IStudent } from "../modules/students/student.model";

declare global {
    namespace Express {
        interface User extends IStudent {}
        interface Request {
            user?: IStudent;
        }
    }
}
