import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import {ModalDashboardComponent} from "../../utils/modal-dashboard/modal-dashboard.component";
import {GestionCajaService} from "../../services/gestion-caja.service";
import {GestionCaja} from "../../interfaces/gestionCaja";
import {LocalService} from "../../utils/sharedMethods/localStorage/local.service";
import {format} from "date-fns";

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
    private localStore : LocalService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
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

  private iniciarOTerminarDia(valor: boolean) {
    this.ngZone.run(() => {
      this.isDiaIniciado = valor;
      this.changeDetectorRef.detectChanges(); // Forzar la actualización de la interfaz de usuario
    });
  }


  public finalizarDia(){
    //pedir confirmacion para finalizar el dia
    const titulo : string = "¿Desea finalizar el día?"
    const subTitulo : string = "Esta acción es irreversible."
    const colorTexto = "#d33"
    this.alertaService.alertaPedirConfirmacionMensajeCustom(titulo, subTitulo, colorTexto)
      .then(
        (result) => {
          if(result.isConfirmed){
            this.modalFinalizarDia()
          }
        }
      );
  }

  //PETICIONES HTTP
  //iniciarDIa

  //obtener la reportes de cja por fecha
  private getGestionCajaByFechas(fechaInicio : string , fechaFin : string | null){
    this.gestionCajaService.getGestionCajaByFecha(fechaInicio, fechaFin)
      .subscribe(
        data => {
          if(data){
            this.gestionCaja = data.object;
            if(data.object.length > 0){
              if(data.object.estadoCaja == true){
                this.iniciarOTerminarDia(true);
                this.localStore.saveData('estadoDia', true.toString());
              }
            }else{
              this.iniciarOTerminarDia(false);
              this.localStore.saveData('estadoDia', false.toString());
            }
          }
        }
      )
  }

  // MODALES

  //Modal iniciar dia
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
                this.iniciarOTerminarDia(true);
                //guardar el estado de la caja y la fecha en local storage
                this.localStore.saveData('fecha', fecha.toISOString());
                this.localStore.saveData('estadoDia', caja.estadoCaja.toString());
              }, error => {
                //en caso de que la base de datos devuelva un status CONFLICT
                //aparecera una alerta indicando que el dia laboral ya fue finalizado
                if(error.status === 409){
                  const mensaje : string = "La caja del día de hoy ya ha sido cerrada, por favor espera al día siguiente para iniciarla nuevamente.";
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }
              }
            )


        }
      }
    )
  }

  //Modal finalizar dia
  private modalFinalizarDia(){
    const dialogRef = this.dialog.open(ModalDashboardComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data : {
        id : this.gestionCaja[0].id,
        totalCalculado: this.gestionCaja[0].totalCalculado,
        totalReportado : this.gestionCaja[0].totalReportado,
        saldoInicioCajaMenor : this.gestionCaja[0].saldoInicioCajaMenor,
        observaciones : this.gestionCaja[0].observaciones,
        fechaHoraInicio: this.gestionCaja[0].fechaHorainicio,
        fechaHoraCierre : this.gestionCaja[0].fechaHoraCierre,
        estadoCaja : this.gestionCaja[0].estadoCaja,
      },
    });

    dialogRef.afterClosed().subscribe(
      result => {

        //crear instancia de gestion caja
        const gestionCaja : GestionCaja = {
          id : result.id,
          totalCalculado : result.totalCalculado,
          totalReportado : result.totalReportado,
          saldoInicioCajaMenor : result.saldoInicioCajaMenor,
          observaciones : result.observaciones,
          fechaHorainicio : result.fechaHoraInicio,
          fechaHoraCierre : result.fechaHoraCierre,
          estadoCaja : result.estadoCaja
        };

        //actualizar el registro en la base de datos
        this.gestionCajaService.actualizarGestionCaja(gestionCaja)
          .subscribe(
            result =>{
              this.alertaService.alertaConfirmarCierreDia();
              //cambiar el estado del dia
              this.iniciarOTerminarDia(false);
              //cambiar el estado en local storage a false
              this.localStore.saveData('estadoDia', gestionCaja.estadoCaja.toString());
            }, error => {
              console.log(error);
            }
          );
      }
    );
  }
}
