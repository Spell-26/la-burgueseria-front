import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";

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
}
