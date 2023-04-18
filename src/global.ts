// global.ts
export class aoaiParam {
    private token;
    private temp;
  
    constructor() {
        if (typeof process.env.AOAI_TOKEN !== 'undefined') {
            this.token = process.env.AOAI_TOKEN;
        } else {
            this.token = 1500;
        }
        if (typeof process.env.AOAI_TEMP !== 'undefined') {
            this.temp = process.env.AOAI_TEMP;
        } else {
            this.temp = 0.7;
        }
    }
  
    public getToken() {
        return this.token;
    }
  
    public getTemp() {
        return this.temp;
    }
  
    public setToken(newToken: number) {
      this.token = newToken;
    }

    public setTemp(newTemp: number) {
        this.temp = newTemp;
      }  
  }