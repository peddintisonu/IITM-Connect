import { IStudent } from "../modules/student/student.model";

declare global {
    namespace Express {
        interface User extends IStudent {}
        interface Request {
            user?: IStudent;
        }
    }
}
