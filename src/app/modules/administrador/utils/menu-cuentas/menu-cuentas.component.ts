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
import {InsumoReservado, ValidarExistenciasService} from "../../components/cuentas/validar-existencias.service";

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
    private router : Router,
    private validarExistencias : ValidarExistenciasService
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
      async result => {

        if (result) {
          //crear instancias
          const cuenta: Cuenta = result.cuenta;
          const productosCuenta: ProductoCuenta[] = [];
          //productos cuenta vinculados a la cuenta con anterioridad
          let productosCuentaExistentes: ProductoCuenta[] = [];
          //VALIDAR SI LA CUENTA FUE DESPACHADA
          // 3 es el id del estado "despachada"
          if (cuenta.estadoCuenta.id == 3) {
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
                                .subscribe();
                            }

                            //actualizar la cuenta
                            this.cuentaService.actualizarCuenta(cuenta)
                              .subscribe();

                            //mostrar alerta actualizacion exitosa
                            this.alertaService.alertaConfirmarCreacion();
                          }//en caso de que se cancele la operacion
                          else if (result.dismiss === Swal.DismissReason.cancel) {
                            this.alertaService.alertaSinModificaciones();
                          }
                        }
                      )
                  }
                }, error => {
                  console.log(error)
                }
              );
          }
          //cuando ya se pagó la cuenta
          else if (cuenta.estadoCuenta.id == 2) {

            //crear instancia de ingreso
            const ingreso: Ingreso = {
              id: 0,
              fecha: null,
              metodoPago: this.metodoDePagoSeleccionado,
              total: cuenta.total,
              cuenta: cuenta
            }
            //ABRIR MODAL PARA SABER EL TIPO DE MÉTODO DE PAGO
            // GUARDAR INGRESO
            this.modalPagar(ingreso).subscribe(
              result => {
                if (result) {
                  //ACTUALIZAR CUENTA
                  this.cuentaService.actualizarCuenta(cuenta)
                    .subscribe(
                      data => {
                        this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id).subscribe(
                          (result)=> {
                            const productoCuenta : ProductoCuenta[] = result.object;
                            productoCuenta.forEach(pc => {
                              pc.estado = 'Pagado';
                              this.productosCuentaService.actualizarProductoCuenta(pc).subscribe();
                            })
                          }
                        )
                        this.alertaService.alertaConfirmarCreacion();
                      },
                      error => {
                        console.log(error)
                      }
                    );
                } else {
                  this.alertaService.alertaSinModificaciones();
                }
              }, error => {
                console.log(error)
              }
            )

          }
          //SI SE VA A MANDAR A PREPARAR LA CUENTA
          else if (cuenta.estadoCuenta.id == 5) {
            try {

              const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id).toPromise();
              if (productosCuenta.object.length > 0) {
                //validar si vienen productos cuyo estado no es despachado
                //y guardarlos en otro array
                const productosCuentaPendientes: ProductoCuenta [] = []
                //seleccionar los productosCuenta que no han sido despachados ni estan en preparacion
                productosCuenta.object.forEach(
                  (productoCuenta : ProductoCuenta) => {
                    if (productoCuenta.estado === 'Por despachar') {
                      productosCuentaPendientes.push(productoCuenta);
                    }
                  }
                );

                // Mostrar alerta de confirmación para editar
                const result = await this.alertaService.alertaPedirConfirmacionEditar();

                if (result.isConfirmed) {
                  // Actualizar el estado de cada producto a "En preparación"
                  await Promise.all(productosCuentaPendientes.map(async (producto: ProductoCuenta) => {
                    producto.estado = "En preparación";
                    await this.productosCuentaService.actualizarProductoCuenta(producto).toPromise();
                  }));

                  // Actualizar la cuenta
                  await this.cuentaService.actualizarCuenta(cuenta).toPromise();

                  // Mostrar alerta de actualización exitosa
                  this.alertaService.alertaConfirmarCreacion();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  this.alertaService.alertaSinModificaciones();
                }

              }
            } catch (error) {
              console.error("Error al procesar la cuenta:", error);
            }
          }
          //EN CASO DE QUE SE VAYA A CANCELAR LA CUENTA
          else if (cuenta.estadoCuenta.id == 4) {
            try {
              const titulo = "¿Deseas cancelar esta cuenta?";
              const subtitulo = "Esta acción es irreversible."
              const color = "#FF0000"
              const alertaConfirmar = await this.alertaService.alertaPedirConfirmacionMensajeCustom(titulo, subtitulo, color);

              if (alertaConfirmar.isConfirmed) {
                //obtener todos los productos vinculados a la cuenta
                let productosCuentaResponse = await this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id).toPromise();
                //depurar los que esten en estado cancelado, pagado, despachado, en preparacion
                const productosCuenta : ProductoCuenta[] = productosCuentaResponse.object.filter((productoCuenta : ProductoCuenta) => {
                  const estado = productoCuenta.estado
                  return estado !== "Pagado" && estado !== "Cancelado" && estado !== 'Despachado' && estado !== 'En preparación';
                });
                //calcular la cantidad de insumos que se deben reponer
                const insumosReponer: InsumoReservado[] = await this.validarExistencias.validarInsumosAReponer(productosCuenta);

                //actualizar cada insumo
                insumosReponer.forEach(insumoR => {
                  //asignar el resultado de la operación al total de la cantidad del insumo
                  insumoR.insumo.cantidad = insumoR.resultadoResta;
                  //guardar cada insumo
                  this.insumoService.actualizarInsumos(insumoR.insumo).subscribe();
                })
                //actualizar el estado de cada productoCuenta
                productosCuenta.forEach(pc => {
                  pc.estado = "Cancelado";
                  this.productosCuentaService.actualizarProductoCuenta(pc).subscribe();
                })
                //actualizar la cuenta
                this.cuentaService.actualizarCuenta(cuenta).subscribe(
                  () => {
                  },
                  error => {
                  },
                  () => {
                    this.alertaService.alertaEliminadoCorrectamente();
                  }
                );
              } else {
                this.alertaService.alertaSinModificaciones();
              }

            } catch {

            }
          }
          //si no cumple con ninguno de los estados
          else {
            this.alertaService.alertaPedirConfirmacionEditar()
              .then(
                (result) => {
                  if (result.isConfirmed) {
                    this.cuentaService.actualizarCuenta(cuenta)
                      .subscribe(
                        data => {
                          this.alertaService.alertaConfirmarCreacion();
                        },
                        error => {
                          console.log(error)
                        }
                      );
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.alertaService.alertaSinModificaciones();
                  }
                }
              )

          }
          //VALIDAR SI SE AÑADIERON MAS PRODUCTOS EN ESTA EDICION
          if (result.productos.length > 0) {
            //el estado con id 1 es por despachar
            cuenta.estadoCuenta.id = 1
            //recorrer el result y asignarlo al array de productoCuenta
            //creando las instancias de productos por cuenta
            //estos se guardan un array para poder ser guardados secuancialmente
            const productosCuenta: ProductoCuenta [] = result.productos;
            //recorrer el result y asignarlo al array de productoCuenta

            for (let producto of productosCuenta) {
              producto.cuenta = cuenta;
            }
            //se debe validar los insumos
            const insumosReservados: InsumoReservado[] = await this.validarExistencias.validarExistencias(productosCuenta);

            //verificar si hay insumos insuficientes
            const insuficientes = insumosReservados.some(insumoR => insumoR.resultadoResta < 0);
            if(insuficientes){
              let mensaje = `<h3>Insumos insuficientes</h3>`;
              insumosReservados.forEach(insumoR => {
                if(insumoR.resultadoResta < 0){
                  mensaje += `<h4>Producto: ${insumoR.producto}, Insumo: ${insumoR.insumo.nombre}, Existencias: ${insumoR.insumo.cantidad}, Cantidad a deducir: ${insumoR.cantidadARestar}</h4>`
                }
                this.alertaService.alertaErrorMensajeCustom(mensaje)
              })
            }else{

              //DEDUCIR LOS INSUMOS
              if(insumosReservados){
                insumosReservados.forEach(insumoR => {
                  insumoR.insumo.cantidad = insumoR.resultadoResta;
                  this.insumoService.actualizarInsumos(insumoR.insumo).subscribe();
                })
              }
              //Crear los productos Cuenta
              productosCuenta.forEach(productoCuenta => {
                this.productosCuentaService.crearProductoCuenta(productoCuenta).subscribe();
              })

              //actualiza cuenta
              this.cuentaService.actualizarCuenta(cuenta)
                .subscribe(
                  data => {},
                  error => {
                    console.log(error)
                  },
                  () => {
                    this.alertaService.alertaConfirmarCreacion();
                  }
                );
            }
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
