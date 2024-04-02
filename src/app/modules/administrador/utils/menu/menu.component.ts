import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {LocalService} from "../sharedMethods/localStorage/local.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf
  ]
})
export class MenuComponent implements OnInit{

  rolEmpleado = this.localStorageService.getUserRole();
  constructor(
    private localStorageService : LocalService
  ) {
  }

  ngOnInit(): void {
  }
}
