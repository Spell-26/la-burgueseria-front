import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ModalCuentasComponent} from "../../utils/modal-cuentas/modal-cuentas.component";
import {Cuenta, EstadoCuenta} from "../../interfaces/cuenta";
import {EmpleadoCuenta} from "../../interfaces/empleadoCuenta";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {CuentasService} from "../../services/cuentas.service";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {EmpleadoCuentaService} from "../../services/empleado-cuenta.service";
import {ModalEditarCuentaComponent} from "../../utils/modal-editar-cuenta/modal-editar-cuenta.component";
import {insumo, InsumoProducto, Producto} from "../../interfaces";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {InsumosService} from "../../services/insumos.service";
import {ModalIngresosComponent} from "../../utils/modal-ingresos/modal-ingresos.component";
import {Ingreso} from "../../interfaces/ingreso";
import {IngresoService} from "../../services/ingreso.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";
import {format} from "date-fns";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";




@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class CuentasComponent implements OnInit{
  //cuentas filtradas por fecha
  cuentasFecha : Cuenta[] = [];

  empleadoCuentas : EmpleadoCuenta[] = [];
  //metodo de pago
  //por defecto efectivo
  metodoDePagoSeleccionado = "Efectivo";

  //DATOS RECIBIDOS DEL COMPONENTE DE CALENDARIO
    datosRecibidos! : { fromDate: Date | null, toDate : Date | null }

    //variables de fecha
    horaActual = this.fechaService.obtenerFechaHoraLocalActual();
    fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
    fechaHoraFinUTC : string | null = null;
  // Variable para el filtro de estados de cuenta
  filtrarEstado : string = '';

  ngOnInit(): void {
    this.cuentaService.refreshNeeded
      .subscribe(
        () =>{
          this.getCuentasByFecha(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
          this.getEmpleadoCuentas();
        }
      );
    //obtener las cuentas del dia de hoy.
    this.getCuentasByFecha(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
    this.getEmpleadoCuentas();

  }

  //recibir datos del componente calendario
    //si la la variable FROMDate es valida, se realizar una conversion de hora local a UTC
    // y se realiza la consulta a la base de datos
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
          this.getCuentasByFecha(this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
      }
  }

  constructor(public dialog : MatDialog,
              private cuentaService :CuentasService,
              private productosCuentaService : ProductosCuentaService,
              private empleadoCuentaService : EmpleadoCuentaService,
              private insumosPorProductoService : InsumosPorProductoService,
              private insumoService : InsumosService,
              private ingresoService : IngresoService,
              private alertaService : AlertasService,
              public fechaService : FechaHoraService) {
  }


  //****************************
  //*******MÉTODOS*******
  //****************************

  //obtener el nombre y apellido del empleado vinculado a una cita dada por el ID
  public getNombreApellidoEmpleado(idCita : number) : string {
    const empleado = this.empleadoCuentas.find(e => e.cuenta.id === idCita);
    return empleado ? `${empleado.empleado.nombre} ${empleado.empleado.apellido}` : 'NaN'
  }

  //funcion para validar si los insumos dentro de un array de productosxcuenta
  //son mayores a 0 luego de la deduccion
  private async validarExistenciasDeProductos(productosCuenta: ProductoCuenta[]): Promise<any> {
    //array donde se almacenaran los insumos junto a sus cantidades por
    //restar, en caso de que alguna de las cantidades sea menor a 0,
    //se debe lanzar la alerta de confirmacion
    let insumosADeducir: any[] = [];
    let insumosInsuficientes: any[] = [];

    const promises = productosCuenta.map(async (productoCuenta) => {
      //almacenar el producto de ProductoCuenta
      const p = productoCuenta.producto;
      //almacenar la cantidad del ProductCuenta
      const c = productoCuenta.cantidad;
      // array para almacenar los InsumosxProducto
      let insumosXProducto: InsumoProducto[] = [];

      //obtener los insumos que hacen parte del producto
      const result = await this.insumosPorProductoService.getIppByProducto(p.id).toPromise();

      //almacenar los insumos x producto
      insumosXProducto = result.object;

      //validar que no sea nulo
      if (insumosXProducto != null && insumosXProducto.length > 0) {
        for (let ixp of insumosXProducto) {
          const cantidadIpp = ixp.cantidad;
          let insumo = ixp.insumo;

          // almaceno el resultado del producto entre la cantidad de
          //productos * la cantidad del insumo asociada al producto
          const cantidadARestar = c * cantidadIpp;
          //guardar las existencias anterior a la resta
          const existenciasAnteriores = insumo.cantidad;

          //instancia de insumo a deducir
          const insumoADeducir = {
            insumo: insumo,
            cantidadARestar: cantidadARestar,
            resultadoResta: insumo.cantidad - cantidadARestar
          };

          //resto la cantidad a restar al insumo
          insumo.cantidad -= cantidadARestar;
          //añadir la instancia al array
          insumosADeducir.push(insumoADeducir);
        }

        //validar si hay algun valor negativo en insumoADeducir.resultadoResta
        const isResultadoNegativo = insumosADeducir.some((insumo) => insumo.resultadoResta < 0);

        //en caso de que sí haya un negativo
        if (isResultadoNegativo) {
          //crear una instancia de un objeto para mostrar cuales son los insumos insuficientes
          insumosADeducir.forEach((insumo) => {
            if (insumo.resultadoResta < 0) {
              insumosInsuficientes.push(insumo);
              //setear el valor del insumo negativo en cero
              insumo.insumo.cantidad = 0;
            } else {
              insumo.insumo.cantidad = insumo.resultadoResta;
            }
          });
        }
        //si las cantidades son positivas
        else {
          insumosADeducir.forEach((insumo) => {
            insumo.insumo.cantidad = insumo.resultadoResta;
          });
        }
      }
    });

    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);

    //armar el objeto a devolver
    const response = {
      aDeducir: insumosADeducir,
      insuficientes: insumosInsuficientes
    };

    return response;
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  private getCuentasByFecha(fechaInicio : string, fechaFin :string | null){

    this.cuentaService.cuentasByFecha(fechaInicio, fechaFin)
      .subscribe(
        data => {
          this.cuentasFecha = data.object
        }, error => {
          console.log(error)
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

  //actualizar cuenta
  private actualizarCuenta(cuenta : Cuenta){
    this.cuentaService.actualizarCuenta(cuenta)
      .subscribe();
  }

  //****************************
  //*******MODALES*******
  //****************************

  public modalCrearCuenta() : void{
    const dialogRef = this.dialog.open(ModalCuentasComponent,{
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
    });

    dialogRef.afterClosed().subscribe(
      result =>{
        if(result){
          // crear instancias
          //estado de la cuenta
          //todas las cuentas se crean con estado ::por despachar::
          const estadoCuenta : EstadoCuenta = {
            id: 1,
            nombre: "Por despachar"
          }
          //cuenta
          const cuenta : Cuenta = {
            id: 0,
            mesa: result.mesa,
            estadoCuenta: estadoCuenta,
            fecha: null,
            total: result.total,
            abono: 0
          }
          //Estancia de empleado por cuenta
          const empleadoCuenta : EmpleadoCuenta = {
            id : 0,
            cuenta: cuenta,
            empleado: result.empleado
          }
          //creando las instancias de productos por cuenta
          //estos se guardan un array para poder ser guardados secuancialmente
          const productosCuenta : ProductoCuenta [] = [];
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

          //ORDEN PARA LA CREACION DE UNA CUENTA
          //1 crear cuenta
          // 2 crear productos por cuenta
          // 3 crear empleado cuenta

          //CREAR CUENTA
          this.cuentaService.crearCuenta(cuenta)
            .subscribe(
              data=> {
                //asignarle a la cuenta el id de la cuenta que ha sido recien creada
                cuenta.id = data.object.id;
                //CREAR PRODUCTOS POR CUENTA
                for (let pc of productosCuenta){
                  this.productosCuentaService.crearProductoCuenta(pc)
                    .subscribe(
                      data=> {

                      },
                      error => {
                        console.log(error)
                      }
                    );
                };
                //CREAR EMPLEADO X CUENTA
                this.empleadoCuentaService.crearEmpleadoCuenta(empleadoCuenta)
                  .subscribe(
                    data=> {

                    },
                    error => {
                      console.log(error)
                    }
                  );
              },
              error => {
                console.log(error)
              }
            );

          //alerta confirmación creación exitosa
          this.alertaService.alertaConfirmarCreacion();
        }

      }
    )
  }
  //MODAL VER CUENTA Y/O EDITAR
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

    let datos = {}
    if(cuenta.estadoCuenta.nombre == 'Pagada'){
      datos = {
        cuenta: cuenta,
        empleado: empleado,
        productos : productosCuenta,
        readOnly : true
      }
    }else{
      datos = {
        cuenta: cuenta,
        empleado: empleado,
        productos : productosCuenta,
      }
    }

    const dialogRef = this.dialog.open(ModalEditarCuentaComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: datos,
    });

    dialogRef.afterClosed().subscribe(
      result => {

        if(result){
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
                async data => {
                  productosCuentaExistentes = data.object;

                  if (productosCuentaExistentes.length > 0) {
                    //validar si vienen productos cuyo estado no es despachado
                    //y guardarlos en otro array
                    const productosCuentaNoDespachados: ProductoCuenta [] = []
                    //seleccionar los productosCuenta que no han sido despachados
                    productosCuentaExistentes.forEach(
                      (productoCuenta) => {
                        if (productoCuenta.estado != 'Despachado') {
                          productosCuentaNoDespachados.push(productoCuenta);
                        }
                      }
                    );

                    const insumosProcesados = await this.validarExistenciasDeProductos(productosCuentaNoDespachados);

                    //validar si hay insumos que quedaron en negativo
                    if (insumosProcesados.insuficientes.length > 0) {
                      //enviar alerta de que existen insumos cuyos existencias quedan en negativo
                      this.alertaService.alertaInsumosNegativos(insumosProcesados.insuficientes)
                        .then(
                          (result) => {
                            //en caso de que desee continuar
                            if (result.isConfirmed) {
                              //cambiar el estado de cada producto cuenta a despachado
                              for (let producto of productosCuentaNoDespachados) {

                                //CAMBIAR EL ESTADO DE CADA PRODUCTO A DESPACHADO
                                producto.estado = "Despachado";

                                //Actualizar el productoCuenta en la base de datos
                                this.productosCuentaService.actualizarProductoCuenta(producto)
                                  .subscribe(
                                    result => {
                                    },
                                    error => {
                                      console.log(error)
                                    }
                                  );
                              }
                              //actualizar todos los insumos guardados en insumosProcesados
                              for (let insumo of insumosProcesados.aDeducir) {
                                this.insumoService.actualizarInsumos(insumo.insumo)
                                  .subscribe(
                                    result => {
                                    },
                                    error => {
                                      console.log(error);
                                    });
                              }

                              this.cuentaService.actualizarCuenta(cuenta)
                                .subscribe(
                                  data => {

                                  },
                                  error => {
                                    console.log(error)
                                  }
                                );

                              //mostrar alerta actualizacion exitosa
                              this.alertaService.alertaConfirmarCreacion();
                            }
                            //en caso de que se cancele la operacion
                            else if (result.dismiss === Swal.DismissReason.cancel) {
                              this.alertaService.alertaSinModificaciones();
                            }
                          }
                        )
                    }//si no hay insumos en negativo
                    else {
                      this.alertaService.alertaPedirConfirmacionEditar()
                        .then(
                          (result) => {
                            //en caso de querer continuar
                            if (result.isConfirmed) {
                              for (let producto of productosCuentaNoDespachados) {

                                //CAMBIAR EL ESTADO DE CADA PRODUCTO A DESPACHADO
                                producto.estado = "Despachado";

                                //Actualizar el productoCuenta en la base de datos
                                this.productosCuentaService.actualizarProductoCuenta(producto)
                                  .subscribe(
                                    result => {
                                    },
                                    error => {
                                      console.log(error)
                                    }
                                  );
                              }
                              //actualizar todos los insumos guardados en insumosProcesados
                              for (let insumo of insumosProcesados.aDeducir) {
                                console.log(insumo)
                                this.insumoService.actualizarInsumos(insumo.insumo)
                                  .subscribe(
                                    result => {
                                    },
                                    error => {
                                      console.log(error);
                                    });
                              }
                              //actualizar la cuenta
                              this.cuentaService.actualizarCuenta(cuenta)
                                .subscribe(
                                  data => {
                                  },
                                  error => {
                                    console.log(error)
                                  }
                                );

                              //mostrar alerta actualizacion exitosa
                              this.alertaService.alertaConfirmarCreacion();
                            }//en caso de que se cancele la operacion
                            else if (result.dismiss === Swal.DismissReason.cancel) {
                              this.alertaService.alertaSinModificaciones();
                            }
                          }
                        )
                    }

                  }

                },error => {
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
                  this.alertaService.alertaConfirmarCreacion();
                },
                error => {
                  console.log(error)
                }
              );
          }
          //si no cumple con ninguno de los estados
          else{
            this.alertaService.alertaPedirConfirmacionEditar()
              .then(
                (result) => {
                  if(result.isConfirmed){
                    this.cuentaService.actualizarCuenta(cuenta)
                      .subscribe(
                        data => {
                          this.alertaService.alertaConfirmarCreacion();
                        },
                        error => {
                          console.log(error)
                        }
                      );
                  }
                  else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.alertaService.alertaSinModificaciones();
                  }
                }
              )

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


