import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-menu-responsive',
  standalone: true,
  imports: [CommonModule, NgbDropdown, NgbDropdownMenu, NgbDropdownItem, NgbDropdownToggle, RouterLink],
  templateUrl: './menu-responsive.component.html',
  styleUrls: ['./menu-responsive.component.css', '../styles/estilosCompartidos.css']
})
export class MenuResponsiveComponent {
  leftCollapsed = true;
  rightCollapsed = true;
  collapsed = true;
}
