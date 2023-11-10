import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [
    RouterLink
  ]
})
export class MenuComponent {
  constructor(private router: Router) {
  }
  goToInsumos():void{
    this.router.navigate(['/insumos'])
  }
}
