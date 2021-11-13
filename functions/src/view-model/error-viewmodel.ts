export interface ErrorContent {
    message: string;
    errorStatus?: number;
    code?: string;
    name?: string;
}

export class ErrorContentInstance implements ErrorContent {
    message = "";
    errorStatus = 0;
    code = '';
    name = '';
    constructor(err: any) {
        this.message = err.message;
        this.errorStatus = err.errorStatus;
        this.code = err.code;
        this.name = err.name;
    }
}