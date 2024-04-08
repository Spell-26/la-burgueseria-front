import {Component, OnInit} from '@angular/core';
import {Egreso} from "../../interfaces/egreso";
import {MatDialog} from "@angular/material/dialog";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {EgresoService} from "../../services/egreso.service";
import {format} from "date-fns";
import {ModalEgresosComponent} from "../../utils/modal-egresos/modal-egresos.component";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";
import {LocalService} from "../../utils/sharedMethods/localStorage/local.service";

@Component({
  selector: 'app-egresos',
  templateUrl: './egresos.component.html',
  styleUrls: ['./egresos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class EgresosComponent implements OnInit{
  constructor(
    public dialog : MatDialog,
    public fechaService : FechaHoraService,
    private egresoService : EgresoService,
    private alertaService : AlertasService,
    private loginService : LoginService,
    private router : Router,
    private localStore : LocalService
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
//verificacion de sesion
  userLoginOn : boolean = false;
  //verificacion de carga de datos
  isLoading = false;
  rolEmpleado = this.localStore.getUserRole();
  ngOnInit(): void {

    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }else if(this.rolEmpleado === 'MESERO'){
      this.router.navigateByUrl('admin')
    }
    else{
      this.egresoService.refreshNeeded
        .subscribe(
          () => {
            this.getEgresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
          }
        );
      this.getEgresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
    }
  }


  //PETICIONES HTTP

  //Obtener todos los egresos de forma paginada y en un rango de fechas
  //por defecto siempre se muestra de fecha del dia actual
  private getEgresoByFechaPage(fechaInicio : string, fechaFin :string | null){
    this.isLoading = true;
    this.egresoService.getEgresoPageableByFecha(fechaInicio, fechaFin, this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.egresos = data.object.content;
          this.isFirst = data.object.first;
          this.isLast = data.object.last;
          for(let egreso of this.egresos){
            const fechaArray : number[]= egreso.fecha;
            let fecha : Date = new Date(
              fechaArray[0],
              fechaArray[1] - 1, // Restar 1 al mes
              fechaArray[2],
              fechaArray[3],
              fechaArray[4],
              fechaArray[5],
              fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
            );
            egreso.fecha = fecha;
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
        },
        () => {
          this.isLoading = false;
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

  //PETICIONES HTTP

  //eliminar egreso
  public deleteEgreso( id : number) : void {

    this.alertaService.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){
            this.egresoService.deleteEgreso(id)
              .subscribe()
          }else if( result.dismiss === Swal.DismissReason.cancel){
            this.alertaService.alertaSinModificaciones()
          }
        }
      )


  }

  //MODALES
  public nuevoEgreso() : void {
    const dialogRef = this.dialog.open(ModalEgresosComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '95vh',
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          //crear la entidad egreso
          const egreso : Egreso = {
            id: 0,
            fecha : null,
            descripcion : result.descripcion,
            total : result.egreso,
            categoria : result.tipoEgreso,
            deduccionDesde : result.deduccionDesde,
            soporte : result.soporte
          }

          //llamar al servicio de egreso y crear el egreso
          this.egresoService.crearEgreso(egreso)
            .subscribe(
              resul => {
                //cuando se crea mostrar alerta de creado correctamente
                this.alertaService.alertaConfirmarCreacion();
              }, error => {
                console.log(error)
              }
            )
        }
      }
    )
  }

  //modal para ver el egreso
  public verEgreso(egreso : Egreso) {
    const dialogRef = this.dialog.open(ModalEgresosComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '80vh',
      data : {
        tipoEgreso : egreso.categoria,
        egreso : egreso.total.toLocaleString(),
        descripcion : egreso.descripcion,
        fecha : this.fechaService.convertirUTCAFechaHoraLocal(egreso.fecha?.toLocaleString()),
        deduccionDesde : egreso.deduccionDesde,
        soporte : egreso.soporte
      }
    });

    dialogRef.afterClosed().subscribe()
  }

}
