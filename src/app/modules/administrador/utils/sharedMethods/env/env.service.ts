import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() { }

  port : number = 8080;
  url : string = `http://localhost:8080/api/v1`
  //url : string = `https://la-burgueseria.onrender.com/api/v1`
  getPort() : number {
    return this.port;
  }
  getUrl() : string {
    return this.url;
  }
}
