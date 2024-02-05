import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() { }

  port : number = 8080;
  //Local URL
  /*url : string = `http://localhost:${this.port}/api/v1`;*/
  //production url
  url : string = `https://la-burgueseria.onrender.com/api/v1`
  getPort() : number {
    return this.port;
  }
  getUrl() : string {
    return this.url;
  }
}
