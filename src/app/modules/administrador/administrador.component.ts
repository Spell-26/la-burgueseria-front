import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit{
  public getScreenWidth : any;
  public getScreenHeight : any;

  public mobileView : boolean = false;
  public desktopView : boolean = false;
  constructor(){}

  ngOnInit(): void {
   this.checkViewPort();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(){
    this.checkViewPort();
  }

  private checkViewPort(){
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    if(this.getScreenWidth >= 960){
      this.desktopView = true;
      this.mobileView = false;
    }
    else if(this.getScreenWidth < 960){
      this.desktopView = false;
      this.mobileView = true;
    }
  }

}
