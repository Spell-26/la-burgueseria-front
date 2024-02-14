import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule, MatIconRegistry} from "@angular/material/icon";

import {DomSanitizer} from "@angular/platform-browser";
import {IconsService} from "./icons/icons.service";
import {CuentasService} from "../../services/cuentas.service";
import {Cuenta} from "../../interfaces/cuenta";
import {EmpleadoCuenta} from "../../interfaces/empleadoCuenta";
import {FechaHoraService} from "../sharedMethods/fechasYHora/fecha-hora.service";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {InsumoProducto} from "../../interfaces";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {EmpleadoCuentaService} from "../../services/empleado-cuenta.service";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {InsumosService} from "../../services/insumos.service";
import {IngresoService} from "../../services/ingreso.service";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";
import {ModalEditarCuentaComponent} from "../modal-editar-cuenta/modal-editar-cuenta.component";
import Swal from "sweetalert2";
import {Ingreso} from "../../interfaces/ingreso";
import {EMPTY, forkJoin, interval, Observable, Subject, switchMap, takeUntil} from "rxjs";
import {ModalIngresosComponent} from "../modal-ingresos/modal-ingresos.component";
import {MatDialog} from "@angular/material/dialog";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu-cuentas',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule],
  templateUrl: './menu-cuentas.component.html',
  styleUrls: ['./menu-cuentas.component.css']
})
export class MenuCuentasComponent implements OnInit, OnDestroy{
  //cuentas filtradas por fecha
  cuentasFecha : Cuenta[] = [];
  cuentasPorDespachar : Cuenta[] = [];
  cuentasEnPreparacion : Cuenta[] = [];
  cuentasDespachadas : Cuenta[] = [];
  cuentasCanceladas : Cuenta[] = [];
  cuentasPagadas : Cuenta[] = [];

  empleadoCuentas : EmpleadoCuenta[] = [];
  //metodo de pago
  //por defecto efectivo
  metodoDePagoSeleccionado = "Efectivo";
  //variables de fecha
  horaActual = this.fechaService.obtenerFechaHoraLocalActual();
  fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
  fechaHoraFinUTC : string | null = null;

  // Utilizaremos un Subject para destruir la suscripción cuando el componente se destruya
  private destroy$: Subject<void> = new Subject<void>();
  //status de login
  userLoginOn = false;
  //obtener datos del usuario
  nombreUsuario = '';
  apellidoUsuario = '';
  rolUsuario = '';

  constructor(
    private iconRegistry : MatIconRegistry,
    private sanitizer : DomSanitizer,
    private icons : IconsService,
    private cuentaService :CuentasService,
    private productosCuentaService : ProductosCuentaService,
    private empleadoCuentaService : EmpleadoCuentaService,
    private insumosPorProductoService : InsumosPorProductoService,
    private insumoService : InsumosService,
    private ingresoService : IngresoService,
    private alertaService : AlertasService,
    public fechaService : FechaHoraService,
    public dialog : MatDialog,
    private loginService : LoginService,
    private router : Router
  ) {


  }

  ngOnInit(): void {
    //icono por despachar
    this.iconRegistry.addSvgIconLiteral('por-despachar', this.sanitizer.bypassSecurityTrustHtml(this.icons.porDespachar));
    this.iconRegistry.addSvgIconLiteral('en-preparacion', this.sanitizer.bypassSecurityTrustHtml(this.icons.enPreparacion));
    this.iconRegistry.addSvgIconLiteral('despachada', this.sanitizer.bypassSecurityTrustHtml(this.icons.despachada));
    this.iconRegistry.addSvgIconLiteral('pagada', this.sanitizer.bypassSecurityTrustHtml(this.icons.pagada));
    this.iconRegistry.addSvgIconLiteral('cancelada', this.sanitizer.bypassSecurityTrustHtml(this.icons.cancelada));

    //obtener variables de sesion
    this.nombreUsuario = sessionStorage.getItem("nombre") || "";
    this.apellidoUsuario = sessionStorage.getItem("apellido") || "";
    this.rolUsuario = sessionStorage.getItem("rol") || "";

    //subscribir a las actualizaciones de cuentas
    this.cuentaService.refreshNeeded
      .subscribe(
        () => {
          forkJoin({
            cuentas: this.cuentaService.cuentasByFecha(this.fechaHoraInicioUTC, this.fechaHoraFinUTC),
            empleados: this.empleadoCuentaService.getEmpleadoCuenta()
          }).subscribe(
            data => {
              this.cuentasFecha = data.cuentas.object;
              this.empleadoCuentas = data.empleados.object;
              this.separateCuentasByEstado(this.cuentasFecha);
            }
          )
        }
      );

    // Obtener las cuentas y empleados al inicio
    this.getCuentasByFecha(this.fechaHoraInicioUTC, this.fechaHoraFinUTC);
    this.getEmpleadoCuentas();

  }
  ngOnDestroy(): void {
    // Destruimos el Subject al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();
  }


  //****************************
  //*******MÉTODOS*******
  //****************************


  //cerrar sesion
  public logOut(){
    const titulo = "¿Estás seguro de cerrar sesión?"
    this.alertaService.alertaPedirConfirmacionMensajeCustom(titulo, "","#fff")
      .then(
        result => {
          if(result.isConfirmed){
            this.loginService.logout()
            this.router.navigateByUrl('home')
          }
        }
      )

  }
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

  private separateCuentasByEstado(cuentas : Cuenta[]) {
    //limpiar mlos arrays de datos antiguos
    this.cuentasPorDespachar  = [];
    this.cuentasEnPreparacion = [];
    this.cuentasDespachadas  = [];
    this.cuentasCanceladas = [];
    this.cuentasPagadas = [];

    // Separar las cuentas por estado
    cuentas.forEach(cuenta => {
      if (cuenta.estadoCuenta.nombre === 'Por despachar') {
        this.cuentasPorDespachar.push(cuenta);
      } else if (cuenta.estadoCuenta.nombre === 'En preparación') {
        this.cuentasEnPreparacion.push(cuenta);
      } else if (cuenta.estadoCuenta.nombre === 'Despachada') {
        this.cuentasDespachadas.push(cuenta);
      } else if (cuenta.estadoCuenta.nombre === 'Pagada') {
        this.cuentasPagadas.push(cuenta);
      } else if (cuenta.estadoCuenta.nombre === 'Cancelada') {
        this.cuentasCanceladas.push(cuenta);
      }
    });
  }


  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  private getCuentasByFecha(fechaInicio : string, fechaFin :string | null){

    this.cuentaService.cuentasByFecha(fechaInicio, fechaFin)
      .subscribe(
        data => {
          if(data){
            this.cuentasFecha = data.object

            this.separateCuentasByEstado(this.cuentasFecha);
          }

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

  //****************************
  //*******MODALES*******
  //****************************
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
    if(cuenta.estadoCuenta.nombre == 'Pagada' || cuenta.estadoCuenta.nombre == "Cancelada"){
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
      width: '450px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: datos,
    });

    dialogRef.afterClosed().subscribe(
      result => {

        if(result){
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
            this.modalPagar(ingreso).subscribe(
              result => {
                if(result){
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
                }else{
                  this.alertaService.alertaSinModificaciones();
                }
              },error => {
                console.log(error)
              }
            )

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
  public modalPagar(ingreso: Ingreso): Observable<any> {
    const dialogRef = this.dialog.open(ModalIngresosComponent, {
      width: '400px',
      position: { right: '0' },
      height: '300px',
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result === null || result === undefined) {
          // Manejar el caso en que el resultado sea nulo
          return EMPTY; // Puedes devolver un observable vacío o manejarlo según tus necesidades
        } else {
          ingreso.metodoPago = result.metodoPago;
          return this.ingresoService.crearIngreso(ingreso);
        }
      })
    );
  }


}
