import {Component, OnInit} from '@angular/core';
import {Ingreso} from "../../interfaces/ingreso";
import {MatDialog} from "@angular/material/dialog";
import {IngresoService} from "../../services/ingreso.service";
import {EmpleadoCuentaService} from "../../services/empleado-cuenta.service";
import {EmpleadoCuenta} from "../../interfaces/empleadoCuenta";
import {Cuenta} from "../../interfaces/cuenta";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {ModalEditarCuentaComponent} from "../../utils/modal-editar-cuenta/modal-editar-cuenta.component";
import {InsumoProducto, Producto} from "../../interfaces";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {InsumosService} from "../../services/insumos.service";
import {CuentasService} from "../../services/cuentas.service";
import {ModalIngresosComponent} from "../../utils/modal-ingresos/modal-ingresos.component";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {format} from "date-fns";

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class IngresosComponent implements OnInit{
  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;
  //ingresos
  ingresos : Ingreso[] = [];
  empleadoCuentas : EmpleadoCuenta[] = [];
  // metodo
  metodoDePagoSeleccionado = "Efectivo";
  //variables de fecha
  horaActual = this.fechaService.obtenerFechaHoraLocalActual();
  fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
  fechaHoraFinUTC : string | null = null;
  //DATOS RECIBIDOS DEL COMPONENTE DE CALENDARIO
  datosRecibidos! : { fromDate: Date | null, toDate : Date | null }

  ngOnInit(): void {
    this.ingresoService.refreshNeeded
      .subscribe(
        () => {
          this.getEmpleadoCuentas();
          this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
        }
      );
    this.getEmpleadoCuentas();
    this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }

  constructor(public dialog : MatDialog,
              private ingresoService : IngresoService,
              private empleadoCuentaService : EmpleadoCuentaService,
              private productosCuentaService : ProductosCuentaService,
              private insumosPorProductoService : InsumosPorProductoService,
              private insumoService : InsumosService,
              private cuentaService : CuentasService,
              public fechaService : FechaHoraService) {
  }


  //PETICIONES HTTP
  private getIngresoByFechaPage(fechaInicio : string, fechaFin :string | null){
    this.ingresoService.getIngresoPagableByFecha(fechaInicio, fechaFin, this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.ingresos = data.object.content;
          this.isFirst = data.object.first;
          this.isLast = data.object.last;
          for (let ingreso of this.ingresos){
            const fechaArray : number[] = ingreso.fecha;
            let fecha : Date = new Date(
              fechaArray[0],
              fechaArray[1] - 1, // Restar 1 al mes
              fechaArray[2],
              fechaArray[3],
              fechaArray[4],
              fechaArray[5],
              fechaArray[6] / 1000000 // Dividir por 1 millón para obtener los milisegundos
            );
            ingreso.fecha = fecha;
          }
        }, error => {
          console.log(error);
        }
      )
  }
  private getEmpleadoCuentas(){
    this.empleadoCuentaService.getEmpleadoCuenta()
      .subscribe(
        data =>{
          if(data){
            this.empleadoCuentas = data.object
          }
        },error => {
          console.log(error)
        }
      )
  }

  //METODOS

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
      this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
    }
  }

  public  nextPage(){
    this.pagina+=1;
    this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }

  //pagina anterior
  public  previousPage(){
    this.pagina-=1;
    this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
  }
  //obtener el nombre y apellido del empleado vinculado a una cita dada por el ID
  public getNombreApellidoEmpleado(idCita : number) : string {
    const empleado = this.empleadoCuentas.find(e => e.cuenta.id === idCita);
    return empleado ? `${empleado.empleado.nombre} ${empleado.empleado.apellido}` : 'NaN'
  }


  //MODALES
  public verCuenta(cuenta : Cuenta) {
    const empleado = this.empleadoCuentas.find(e => e.cuenta.id === cuenta.id);
    let productosCuenta : ProductoCuenta [] = [];

    this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id)
      .subscribe(
        data => {
          productosCuenta.push(data.object) ;
        },error =>{
          console.log(error)
        }
      );

    const datos = {
      cuenta: cuenta,
      empleado: empleado,
      productos : productosCuenta,
      readOnly : true
    }


    const dialogRef = this.dialog.open(ModalEditarCuentaComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: datos,
    });

    dialogRef.afterClosed().subscribe(
      result => {

      }
    )
  }

  //modal pagar
  public modalPagar(ingreso : Ingreso){

    const dialogRef = this.dialog.open(ModalIngresosComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '300px',
    });
    dialogRef.afterClosed().subscribe(
      result =>{
        ingreso.metodoPago = result.metodoPago

        this.ingresoService.crearIngreso(ingreso)
          .subscribe(
            result => {

            }, error => {
              console.log(error)
            }
          )
      }
    )
  }
}
