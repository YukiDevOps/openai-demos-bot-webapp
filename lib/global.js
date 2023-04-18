"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aoaiParam = void 0;
// global.ts
class aoaiParam {
    constructor() {
        if (typeof process.env.AOAI_TOKEN !== 'undefined') {
            this.token = process.env.AOAI_TOKEN;
        }
        else {
            this.token = 1500;
        }
        if (typeof process.env.AOAI_TEMP !== 'undefined') {
            this.temp = process.env.AOAI_TEMP;
        }
        else {
            this.temp = 0.7;
        }
    }
    getToken() {
        return this.token;
    }
    getTemp() {
        return this.temp;
    }
    setToken(newToken) {
        this.token = newToken;
    }
    setTemp(newTemp) {
        this.temp = newTemp;
    }
}
exports.aoaiParam = aoaiParam;
//# sourceMappingURL=global.js.map