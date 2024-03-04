import { Component } from '@angular/core';
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [
    MatTooltipModule
  ]
})
export class FooterComponent {

}
