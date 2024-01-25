import {Component, OnInit} from '@angular/core';
import {Egreso} from "../../interfaces/egreso";
import {MatDialog} from "@angular/material/dialog";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {EgresoService} from "../../services/egreso.service";
import {format} from "date-fns";

@Component({
  selector: 'app-egresos',
  templateUrl: './egresos.component.html',
  styleUrls: ['./egresos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class EgresosComponent implements OnInit{
  constructor(
    public dialog : MatDialog,
    public fechaService : FechaHoraService,
    private egresoService : EgresoService
  ) {
  }


  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;
  //egresos
  egresos : Egreso[] = [];
  //variables de fecha
  horaActual = this.fechaService.obtenerFechaHoraLocalActual();
  fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
  fechaHoraFinUTC : string | null = null;
  //DATOS RECIBIDOS DEL COMPONENTE DE CALENDARIO
  datosRecibidos! : { fromDate: Date | null, toDate : Date | null }

  ngOnInit(): void {
  }


  //PETICIONES HTTP

  //Obtener todos los egresos de forma paginada y en un rango de fechas
  //por defecto siempre se muestra de fecha del dia actual
  private getEgresoByFechaPage(fechaInicio : string, fechaFin :string | null){
    this.egresoService.getEgresoPageableByFecha(fechaInicio, fechaFin, this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.egresos = data.object.content;
          this.isFirst = data.object.first;
          this.isLast = data.object.last;
        }, error => {
          console.log(error)
        }
      )
  }

  //METODOS

  //funcion para recibir los datos del componente calendario
  recibirDatosCalendario(datos : {fromDate: Date | null, toDate : Date | null }){
    this.datosRecibidos = datos;
    const pattern = 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX';

    if(this.datosRecibidos.fromDate != null){
      this.fechaHoraInicioUTC = format(this.datosRecibidos.fromDate, pattern);
      //converir a UTC
      this.fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.fechaHoraInicioUTC);
      if(this.datosRecibidos.toDate != null){
        this.fechaHoraFinUTC = format(this.datosRecibidos.toDate, pattern);
        //convertir a UTC
        this.fechaHoraFinUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.fechaHoraFinUTC);
      }else{
        this.fechaHoraFinUTC = null;
      }
      this.getEgresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
    }
  }

  //siguiente pagina
  public  nextPage(){
    this.pagina+=1;
    this.getEgresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }

  //pagina anterior
  public  previousPage(){
    this.pagina-=1;
    this.getEgresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }

}
