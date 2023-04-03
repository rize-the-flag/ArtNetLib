import {ArtNetErrorCode} from "./types";

export class ArtNetLibError extends Error {
    accessor code: ArtNetErrorCode;
    constructor(
        code: ArtNetErrorCode,
        message?: string,
    ) {
        super(message)
        this.code = code;
    }
}