import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() { }

  port : number = 8090;
  url : string = `http://localhost:${this.port}/api/v1`;
  getPort() : number {
    return this.port;
  }
  getUrl() : string {
    return this.url;
  }
}
