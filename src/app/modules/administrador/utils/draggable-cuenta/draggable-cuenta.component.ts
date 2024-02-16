import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Cuenta } from "../../interfaces/cuenta";

@Component({
  selector: 'app-draggable-cuenta',
  templateUrl: './draggable-cuenta.component.html',
  styleUrls: ['./draggable-cuenta.component.css',  '../styles/estilosCompartidos.css', '../../components/cuentas/cuentas.component.css']
})
export class DraggableCuentaComponent implements OnInit {
  @ViewChild('innerContainer', { static: true }) innerContainerRef!: ElementRef<HTMLDivElement>;
  @Input() cuenta!:Cuenta;
  @Input() nombreEmpleado!: String;

  startX: number = 0;
  startY : number = 0;
  containerWidth: number = 0;
  containerHeight: number = 0;
  isDragging: boolean = false;
  thresholdPercentage: number = 30;
  colorFondo: string = 'black';


  constructor() { }

  ngOnInit() {
    this.containerWidth = this.innerContainerRef.nativeElement.getBoundingClientRect().width;
    this.containerHeight = this.innerContainerRef.nativeElement.getBoundingClientRect().height;
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('touchmove', this.drag);
    document.addEventListener('mouseup', this.endDrag);
    document.addEventListener('touchend', this.endDrag);
  }

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.startY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
  }

  drag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;

    // Verificar si el estado de la cuenta es "Pagada" o "Cancelada"
    if (this.cuenta.estadoCuenta.nombre === 'Pagada' || this.cuenta.estadoCuenta.nombre === 'Cancelada') {
      return; // No hacer nada si el estado es "Pagada" o "Cancelada"
    }

    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const currentY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    const offsetX = currentX - this.startX;
    const offsetY = currentY - this.startY;

    const absOffsetX = Math.abs(offsetX);
    const absOffsetY = Math.abs(offsetY);

    // Verifica si el movimiento es principalmente horizontal o vertical
    if (absOffsetX > absOffsetY && absOffsetX > 5) {
      // Movimiento horizontal significativo, bloquea el evento predeterminado
      event.preventDefault();
    }

    const maxOffsetX = this.containerWidth * this.thresholdPercentage / 100;
    if (offsetX > maxOffsetX + 100) {
      event.stopPropagation();
      return;
    }

    if (offsetX >= maxOffsetX) {
      this.colorFondo = 'green';
    } else {
      this.colorFondo = 'black';
    }

    if (offsetX < 0) return;

    this.innerContainerRef.nativeElement.style.transform = `translateX(${offsetX}px)`;
  }

  endDrag = () => {
    if (!this.isDragging) return;
    this.isDragging = false;

    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('touchmove', this.drag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchend', this.endDrag);

    const transformValue = this.innerContainerRef.nativeElement.style.transform;
    const transformArray = transformValue.split('(')[1].split('px')[0].split(', ');
    const offsetX = parseFloat(transformArray[0]);

    this.innerContainerRef.nativeElement.style.transform = 'translateX(0)';

    const maxOffsetX = this.containerWidth * this.thresholdPercentage / 100;

    if (offsetX >= maxOffsetX) {
      console.log("Se alcanzó el 70% del contenedor.");
    }

    this.addEventListeners()
  }
}
