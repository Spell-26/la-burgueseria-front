import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'bootstrap-range-calendar',
  standalone: true,
  imports: [NgbDatepickerModule, FormsModule, JsonPipe],
  templateUrl: './bootstrap-range-calendar.component.html',
  styleUrls: ['./bootstrap-range-calendar.component.css', '../../styles/estilosCompartidos.css'],

})
export class BootstrapRangeCalendarComponent implements OnInit{

  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;
  toDate: NgbDate | null = null;

  ngOnInit(): void {

    this.fromDate = this.calendar.getToday();
    this.toDate = null;

    //emitir el evento al padre
    this.emitirDatos()
  }


  //crear el evento para enviar información al componente padre
  @Output() fechasEnviadas : EventEmitter<{
    fromDate: Date | null, toDate : Date | null
  }>  = new EventEmitter();


  //funcion para emitir los datos al componente padre
  emitirDatos(){
    const fromDate = this.convertirNgbDateToDate(this.fromDate);
    const toDate = this.convertirNgbDateToDate(this.toDate);

    this.fechasEnviadas.emit({fromDate, toDate});
  }
  //funcion para convertir de ngbDate a Date
  private convertirNgbDateToDate(ngbDate: NgbDate | null): Date | null {
    return ngbDate ? new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day, 12, 0, 0) : null;
  }
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    //emitir datos cuando se hacer una seleccion de fecha
    this.emitirDatos();
  }

  isHovered(date: NgbDate) {
    return (
        this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
        date.equals(this.fromDate) ||
        (this.toDate && date.equals(this.toDate)) ||
        this.isInside(date) ||
        this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }


}
