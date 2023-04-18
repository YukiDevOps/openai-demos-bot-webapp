// global.ts
export class aoaiParam {
    private token: number;
    private temp: number;
  
    constructor() {
        if (typeof process.env.AOAI_TOKEN !== 'undefined') {
            this.token = Number(process.env.AOAI_TOKEN);
        } else {
            this.token = 1500;
        }
        if (typeof process.env.AOAI_TEMP !== 'undefined') {
            this.temp = Number(process.env.AOAI_TEMP);
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