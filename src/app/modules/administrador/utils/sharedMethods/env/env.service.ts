import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() { }
  fontEndHost = 'http://localhost:4200';
  port : number = 8080;

  //url : string = `http://localhost:8080/api/v1`;
  //urlHost : string = `http://localhost:8080`;

  url : string = `https://la-burgueseria.onrender.com/api/v1`
  urlHost : string = `https://la-burgueseria.onrender.com`
  getPort() : number {
    return this.port;
  }
  getUrl() : string {
    return this.url;
  }
  getHostUrl() : string {
    return this.urlHost;
  }
  getFontUrl() : string{
    return this.fontEndHost;
  }
}
