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
          this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
        }
      );
    this.getIngresoByFechaPage(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
    this.getEmpleadoCuentas();
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
        }, error => {
          console.log(error);
        }
      )
  }
  private getEmpleadoCuentas(){
    this.empleadoCuentaService.getEmpleadoCuenta()
      .subscribe(
        data =>{
          this.empleadoCuentas = data.object
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
        console.log(result)

        //crear instancias
        const cuenta : Cuenta = result.cuenta;
        const productosCuenta : ProductoCuenta[] = [];
        //productos cuenta vinculados a la cuenta con anterioridad
        let productosCuentaExistentes : ProductoCuenta[] = [];
        //VALIDAR SI LA CUENTA FUE DESPACHADA
        // 3 es el id del estado "despachada"
        if(cuenta.estadoCuenta.id == 3){
          //CAMBIAR TODOS LOS PRODUCTOS VINCULADOS A ESTA CUENTA A DESPACHADOS
          this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id)
            .subscribe(
              data => {
                productosCuentaExistentes = data.object;
                if(productosCuentaExistentes.length > 0){

                  //cambiar el estado de cada producto cuenta a despachado
                  for(let producto of productosCuentaExistentes){
                    //variable para validar si el cambio es nuevo y no es redundante
                    const estadoAntiguo = producto.estado;
                    producto.estado = "Despachado";
                    //Actualizar el producto en la base de datos
                    this.productosCuentaService.actualizarProductoCuenta(producto)
                      .subscribe(
                        result =>{
                          //INICIO DEL PROCESO PARA RESTAR INSUMOS CUANDO SE DESPACHA EL PRODUCTO
                          //validar que las dos variables sean distintas
                          if(estadoAntiguo !== producto.estado){
                            const productoCuentaActualizado : ProductoCuenta = result.object;
                            const producto : Producto = productoCuentaActualizado.producto;
                            const cantidad = productoCuentaActualizado.cantidad;

                            let ipps : InsumoProducto[] = [];

                            this.insumosPorProductoService.getIppByProducto(producto.id)
                              .subscribe(
                                result =>{
                                  ipps = result.object;
                                  //validar que si haya campos en los ipp
                                  if(ipps.length > 0){
                                    for(let ipp of ipps){
                                      const cantidadIpp = ipp.cantidad;
                                      let insumo = ipp.insumo;
                                      //se debe multiplicar la cantidad del ingrediente por la
                                      // cantidad de produtos solicitdados y el resultado debe restarse al stock
                                      // del insumo
                                      //si el resultado es menor que cero se debe poner un mensaje en consola
                                      // TODO: mostrar una alerta cuando sea menor que cero
                                      // TODO: la alerta debe dar la opcion de continuar o abortar la operacion
                                      // TODO: tal caso el stock se asignara a 0 y no a un numero negativo

                                      const insumosARestar = cantidad * cantidadIpp;

                                      insumo.cantidad = insumo.cantidad - insumosARestar;

                                      if(insumo.cantidad < 0){
                                        //TODO: falta alerta
                                        console.log("Se ha exedido la cantidad de existencias de este insumo")
                                        insumo.cantidad = 0;
                                      }
                                      // ACTUALIZAR EL INSUMO
                                      this.insumoService.actualizarInsumos(insumo)
                                        .subscribe(
                                          result=>{

                                          },
                                          error => {
                                            console.log(error)
                                          }
                                        )
                                    }
                                  }
                                },error => {
                                  console.log(error)
                                }
                              )
                          }
                        },
                        error => {
                          console.log(error)
                        }
                      );
                  }
                }

              },error => {
                console.log(error)
              }
            );
          this.cuentaService.actualizarCuenta(cuenta)
            .subscribe(
              data => {
                console.log(data)
              },
              error => {
                console.log(error)
              }
            );
        }
        //cuando ya se pagó la cuenta
        else if(cuenta.estadoCuenta.id == 2){

          //crear instancia de ingreso
          const ingreso : Ingreso = {
            id : 0,
            fecha : null,
            metodoPago : this.metodoDePagoSeleccionado,
            total: cuenta.total,
            cuenta: cuenta
          }
          //ABRIR MODAL PARA SABER EL TIPO DE MÉTODO DE PAGO
          // GUARDAR INGRESO
          this.modalPagar(ingreso)
          //ACTUALIZAR CUENTA
          this.cuentaService.actualizarCuenta(cuenta)
            .subscribe(
              data => {
                console.log(data)
              },
              error => {
                console.log(error)
              }
            );
        }
        //si no cumple con ninguno de los estados
        else{

          this.cuentaService.actualizarCuenta(cuenta)
            .subscribe(
              data => {

              },
              error => {
                console.log(error)
              }
            );
        }
        //VALIDAR SI SE AÑADIERON MAS PRODUCTOS EN ESTA EDICION
        if(result.productos.length > 0){
          //el estado con id 1 es por despachar
          cuenta.estadoCuenta.id = 1
          //recorrer el result y asignarlo al array de productoCuenta
          for (let producto of result.productos){
            //crear instancia de producto por cuenta
            const productoXCuenta : ProductoCuenta = {
              id: 0,
              cuenta: cuenta,
              producto: producto.obj,
              cantidad: producto.cantidad,
              estado: "Por despachar"
            };
            //una vez creado la instancia se añade al arreglo donde se contendrán
            productosCuenta.push(productoXCuenta);
          }
          //guardar todos los neuvos productos
          for (let pc of productosCuenta){
            this.productosCuentaService.crearProductoCuenta(pc)
              .subscribe(
                data=> {},
                error => {
                  console.log(error)
                }
              );
          };
          this.cuentaService.actualizarCuenta(cuenta)
            .subscribe(
              data => {

              },
              error => {
                console.log(error)
              }
            );
        }
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
              console.log(result)
            }, error => {
              console.log(error)
            }
          )
      }
    )
  }
}
