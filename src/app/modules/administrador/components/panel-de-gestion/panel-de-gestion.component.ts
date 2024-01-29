import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import {ModalDashboardComponent} from "../../utils/modal-dashboard/modal-dashboard.component";
import {GestionCajaService} from "../../services/gestion-caja.service";
import {GestionCaja} from "../../interfaces/gestionCaja";

@Component({
  selector: 'app-panel-de-gestion',
  templateUrl: './panel-de-gestion.component.html',
  styleUrls: ['./panel-de-gestion.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class PanelDeGestionComponent implements OnInit, OnDestroy{
  isDiaIniciado : boolean = false;
  //hora y fecha para el reloj del header
  tiempoActual : string = '';
  private tiempoSubscription : Subscription | undefined;
  //variables de fecha
  horaActual = this.fechaService.obtenerFechaHoraLocalActual();
  fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
  fechaHoraFinUTC : string | null = null;
  //gestionCaja
  public gestionCaja : GestionCaja[] = [];


  constructor(
    public dialog : MatDialog,
    public fechaService : FechaHoraService,
    private alertaService : AlertasService,
    private gestionCajaService : GestionCajaService,
  ) {
  }

  ngOnDestroy(): void {
    // Destruir la subscripcion cuando el componente se destruye
    if (this.tiempoSubscription) {
      this.tiempoSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    // Iniciar la suscripción al observable que emite cada segundo
    this.tiempoSubscription = interval(1000).subscribe(() => {
      this.actualizarTiempo();
    });

    this.gestionCajaService.refreshNeeded
      .subscribe(
        () => {
          //logica cuando se debe refrescar el componente
          this.getGestionCajaByFechas(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
        }
      );

    //al iniciar el compoente buscar si hay ahy una caja abierda ese mismo dia
    this.getGestionCajaByFechas(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }

  //FUNCIONES

  //Funcion para actualizar el reloj
  private actualizarTiempo() {
    const fechaActual = new Date();

    // Obtener componentes de fecha
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript comienzan desde 0
    const ano = fechaActual.getFullYear();

    // Obtener componentes de hora
    let horas = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const segundos = fechaActual.getSeconds();

    // Determinar si es a.m. o p.m.
    const amPm = horas >= 12 ? 'p.m.' : 'a.m.';

    // Convertir a formato de 12 horas
    if (horas > 12) {
      horas -= 12;
    }

    // Formatear el tiempo y la fecha con el formato DD-MM-YYYY HH:mm:ss a.m./p.m.
    this.tiempoActual = `${this.agregarCero(dia)}-${this.agregarCero(mes)}-${ano} ${this.agregarCero(horas)}:${this.agregarCero(minutos)}:${this.agregarCero(segundos)} ${amPm}`;
  }

  private agregarCero(valor: number): string {
    return valor < 10 ? `0${valor}` : `${valor}`;
  }

  public iniciarOTerminarDia(){

    //debe lanzar alerta de confirmación para iniciar el dia
    //en caso de inicar el día debe mostrar un modal para asignar el valor de inicio en la caja menor
    //el valor de la caja menor se guarda en local storage junto con el estado de la variable isDiaIniciado
    //cuando se cierra y el dia debe pedir confirmacion
    //si es acertiva se abre modal para que se ingrese el total recaudado y se guarda en la base de datos
    //EN CASO DE QUE SE VAYA A TERMINAR EL DIA SE GIGUE ESTA LOGICA

      //modificar esta logica luego
      this.isDiaIniciado = !this.isDiaIniciado;

  }

  //PETICIONES HTTP
  //iniciarDIa
  private iniciarDia(gestionCaja : GestionCaja){
    this.gestionCajaService.crearGestionCaja(gestionCaja)
      .subscribe()
  }
  //obtener la reportes de cja por fecha
  private getGestionCajaByFechas(fechaInicio : string , fechaFin : string | null){
    this.gestionCajaService.getGestionCajaByFecha(fechaInicio, fechaFin)
      .subscribe(
        data => {
          if(data){
            this.gestionCaja = data.object;
            if(data.object.length > 0){
              this.isDiaIniciado = true;
            }
          }
        }
      )
  }

  // MODALES

  public modalIniciarDia(){
    const dialogRef = this.dialog.open(ModalDashboardComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '300px',
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          let fecha: Date = new Date(this.fechaHoraInicioUTC);
          // Convertir la fecha a formato UTC
          let fechaUTC: Date = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), fecha.getUTCHours(), fecha.getUTCMinutes(), fecha.getUTCSeconds());

          const caja : GestionCaja = {
            id : 0,
            totalCalculado: result.totalCalculado,
            totalReportado : result.totalReportado,
            saldoInicioCajaMenor : result.saldoInicioCajaMenor,
            observaciones : result.observaciones,
            fechaHorainicio : fecha,
            fechaHoraCierre : null,
            estadoCaja : true
          }

          this.gestionCajaService.crearGestionCaja(caja)
            .subscribe(
              result=>{
                this.alertaService.alertaDiaIniciadoCorrectamente();
                this.iniciarOTerminarDia();
              }, error => {
                console.log(error);
              }
            )


        }
      }
    )
  }
}
