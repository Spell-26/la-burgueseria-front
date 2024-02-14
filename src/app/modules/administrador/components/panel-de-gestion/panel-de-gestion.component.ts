import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, interval, Subscription} from "rxjs";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import {ModalDashboardComponent} from "../../utils/modal-dashboard/modal-dashboard.component";
import {GestionCajaService} from "../../services/gestion-caja.service";
import {GestionCaja} from "../../interfaces/gestionCaja";
import {LocalService} from "../../utils/sharedMethods/localStorage/local.service";
import {addDays, format} from "date-fns";
import {EgresoService} from "../../services/egreso.service";
import {CuentasService} from "../../services/cuentas.service";
import {Cuenta} from "../../interfaces/cuenta";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";

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
  //variables para los reportes de cierre de caja y de egresos
  resumenCaja : any [] = [];
  resumenEgreso : any[] = [];
  //cajas pendientes
  cajasPendientes : GestionCaja[] = [];
  public allGestionCaja : GestionCaja[] = [];
  caja : GestionCaja | null = null;
  //validacion se sesion
  userLoginOn = false;

  constructor(
    public dialog : MatDialog,
    public fechaService : FechaHoraService,
    private alertaService : AlertasService,
    private gestionCajaService : GestionCajaService,
    private localStore : LocalService,
    private egresoService : EgresoService,
    private cuentaService : CuentasService,
    protected loginService : LoginService,
    private router : Router
  ) {
  }

  ngOnDestroy(): void {
    // Destruir la subscripcion cuando el componente se destruye
    if (this.tiempoSubscription) {
      this.tiempoSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    //si no tiene sesion
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }
    else{
      // Iniciar la suscripción al observable que emite cada segundo
      this.tiempoSubscription = interval(1000).subscribe(() => {
        this.actualizarTiempo();
      });

      this.gestionCajaService.refreshNeeded
        .subscribe(
          () => {
            //logica cuando se debe refrescar el componente
            this.getGestionCajaByFechas(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
            //obtener resumen
            this.getResumen();
            this.validateCajas();
            this.getAllGestionCaja();
          }
        );

      //al iniciar el compoente buscar si hay ahy una caja abierda ese mismo dia
      this.getGestionCajaByFechas(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
      //obtener resumen
      this.getResumen();
      this.getAllGestionCaja();
      this.validateCajas();

    }


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
      this.isDiaIniciado = valor;
  }


  public finalizarDia(fechaOpcional?: string, caja?: GestionCaja) {
    // pedir confirmacion para finalizar el dia
    const titulo: string = "¿Desea finalizar el día?";
    const subTitulo: string = "Esta acción es irreversible.";
    const colorTexto = "#d33";

    // Verificar que no hayan cuentas en: pendientes por despachar, en preparacion o despachadas
    let cuentas: Cuenta[] = [];
    let isCuentasPendientes = false;

    // en caso de que se envie una caja
    //se almacena, sino sigue siendo null
    this.caja = caja ? caja : null;

    // Si se proporciona una fecha opcional, usarla en lugar de this.fechaHoraInicioUTC
    const fechaConsulta = fechaOpcional ? fechaOpcional : this.fechaHoraInicioUTC;

    // obtener todas las cuentas que hay en el día laboral actual o en la fecha opcional
    this.cuentaService.cuentasByFecha(fechaConsulta, null)
      .subscribe(
        result => {
          if (result) {
            // almacenar las cuentas consultadas en la variable cuentas
            cuentas = result.object;
            // se recorre el array, en caso de que haya alguna cuenta que cumpla con las condiciones se cambia el estado de la flag
            for (let cuenta of cuentas) {
              if (cuenta.estadoCuenta.nombre == "Por despachar" || cuenta.estadoCuenta.nombre == "Despachada" || cuenta.estadoCuenta.nombre == "En preparación") {
                isCuentasPendientes = true;
              }
            }
            // En caso de que en la iteración se haya cambiado el estado de la variable
            // se lanza el mensaje de alerta pidiendo que se resuelva el estado de las cuentas antes de continuar
            if (isCuentasPendientes) {
              const mensaje: string = "Al parecer aún hay cuentas pendientes, por favor cobralas antes de continuar con el cierre."
              this.alertaService.alertaErrorMensajeCustom(mensaje);
            }
            // Si no hay ninguna cuenta que cumpla las condiciones, entonces se procede con el cierre de día normalmente
            else {
              this.alertaService.alertaPedirConfirmacionMensajeCustom(titulo, subTitulo, colorTexto)
                .then(
                  (result) => {
                    if (result.isConfirmed) {
                      this.modalFinalizarDia(this.caja);
                    }
                  }
                );
            }
          }
        }
      );
  }

  //validar que no hayan cajas pendientes de cierre
  private validateCajas(){
    this.gestionCajaService.listAll()
      .subscribe(
        data => {
          if(data.object.length > 0){
            //limpiar el array de cajas pendientes
            this.cajasPendientes = []
            //recorrer la response
            for(let caja of data.object){
              //en caso de que alguna caja aún este abierta
              if(caja.estadoCaja){
                //validar que no se trate de la cuenta del dia actual
                //no se tomarán en cuenta las cajas del dia de la caja actual ni del día siguiente
                if(this.gestionCaja.length > 0 && this.gestionCaja[0].fechaHorainicio != null){
                  const fechaArray: number[] = caja.fechaHorainicio;
                  const fecha: Date = new Date(
                    fechaArray[0],
                    fechaArray[1] - 1, // Restar 1 al mes
                    fechaArray[2],
                    fechaArray[3],
                    fechaArray[4],
                    fechaArray[5],
                    fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
                  );

                  let fechaString = fecha.toISOString();

                  //convertir this.gestionCaja[0].fechaHorainicio a string y almacenarlo
                  let fechaInicioString = this.gestionCaja[0].fechaHorainicio.toString()
                  const fechaInicio = format(fechaInicioString, "dd/MM/yyyy")
                  const fechaFin = addDays(fechaInicio, 1).toString();

                  //ahora convertir la fechaHoraInicio de cada caja al formato y comparar para ver
                  //si es elegible para añadir al array
                  const fechaCajaFormat = format(fechaString, "dd/MM/yyyy")

                  if(fechaCajaFormat != fechaInicio && fechaCajaFormat != fechaFin){
                    this.cajasPendientes.push(caja);
                  }
                }else{
                  this.cajasPendientes.push(caja);
                }
              }
            }
            //En caso de que si hayan cajas pendientes de cierre
            if(this.cajasPendientes.length > 0){

              for(let caja of this.cajasPendientes){
                if(caja.fechaHorainicio !== null){

                  //obtener fecha de la caja
                  const fechaArray: number[] = caja.fechaHorainicio;
                  const fechaInicio: Date = new Date(
                    fechaArray[0],
                    fechaArray[1] - 1, // Restar 1 al mes
                    fechaArray[2],
                    fechaArray[3],
                    fechaArray[4],
                    fechaArray[5],
                    fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
                  );

                  let fechaString = fechaInicio.toISOString();

                  const fecha = format(fechaString, "dd/MM/yyyy")

                  //mensaje para avisar que hay una caja sin cierre
                  const mensaje : string = `Al parecer tienes una caja a la espera de cierre
                  del día ${fecha}, por favor gestiona el cierre respectivo en la pestaña: "Históricos de caja".`
                  const title : string = "¡Tienes cajas pendientes!";
                  const color  = "#FF0000";
                  const btnText1 : string = "Cerrar";

                  //lanzar alerta con los datos
                  this.alertaService.alertaErrorBuilderCustom(mensaje, title, btnText1, color)
                    .then(
                      (result) => {
                        if(result.isConfirmed){
                        }
                      }
                    )
                }
              }
            }
          }
        }
      )
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
            if(this.gestionCaja.length > 0){
              if(this.gestionCaja[0].estadoCaja){
                const fechaArray: number[] = this.gestionCaja[0].fechaHorainicio;
                const fechaInicio: Date = new Date(
                  fechaArray[0],
                  fechaArray[1] - 1, // Restar 1 al mes
                  fechaArray[2],
                  fechaArray[3],
                  fechaArray[4],
                  fechaArray[5],
                  fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
                );
                this.gestionCaja[0].fechaHorainicio = fechaInicio.toISOString();
                this.iniciarOTerminarDia(true);
                this.localStore.saveData('estadoDia', true.toString());
              }
            }else{
              this.iniciarOTerminarDia(false);
              this.localStore.saveData('estadoDia', false.toString());
            }
          }
        }, error => {
          if(error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")){
            this.loginService.logout(); //quitar todas las credenciales de sesion
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          }else{
            console.log(error)
          }
        }
      )
  }


  private getAllGestionCaja(){
    this.gestionCajaService.listAll()
      .subscribe(
        data => {
          if(data){
            this.allGestionCaja = data.object

            for(let caja of this.allGestionCaja){
              const fechaArray: number[] = caja.fechaHorainicio;
              const fechaInicio: Date = new Date(
                fechaArray[0],
                fechaArray[1] - 1, // Restar 1 al mes
                fechaArray[2],
                fechaArray[3],
                fechaArray[4],
                fechaArray[5],
                fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
              );

              caja.fechaHorainicio = fechaInicio
            }
          }
        }
      )
  }


  private getResumen(){
    //consultar los resumen de cajas cerradas y de egresos
    forkJoin([
      this.gestionCajaService.getResumen(),
      this.egresoService.getResumen()
    ]).subscribe(
      ([cajaResult, egresoResult]) => {
        if(cajaResult.object.length > 0){
          this.resumenCaja = cajaResult.object
        }

        if(egresoResult.object.length > 0){
          this.resumenEgreso = egresoResult.object
        }
      }, error => {
        console.log(error);
      }
    );
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
  protected modalFinalizarDia(cajaDTO ? : GestionCaja | null){
    let dialogRef : MatDialogRef<ModalDashboardComponent>;
    //en caso de que se envie algo por el campo de caja
    if(cajaDTO != null){
      let caja : GestionCaja = { ... cajaDTO};
      //restar 5 horas
      let fecha = new Date(caja.fechaHorainicio);
      fecha.setHours(fecha.getHours() - 5);
      caja.fechaHorainicio = fecha.toISOString();

      dialogRef = this.dialog.open(ModalDashboardComponent, {
        width: '400px', // Ajusta el ancho según tus necesidades
        position: { right: '0' }, // Posiciona el modal a la derecha
        height: '600px',
        data : {
          id : caja.id,
          totalCalculado: caja.totalCalculado,
          totalReportado : caja.totalReportado,
          saldoInicioCajaMenor : caja.saldoInicioCajaMenor,
          observaciones : caja.observaciones,
          fechaHoraInicio: caja.fechaHorainicio,
          fechaHoraCierre : caja.fechaHoraCierre,
          estadoCaja : caja.estadoCaja,
        },
      });
    }//si no se envia nada
    else{
      dialogRef = this.dialog.open(ModalDashboardComponent, {
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
    }

    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
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
      }
    );
  }
}
