import {Component, OnInit} from '@angular/core';
import {Cuenta, EstadoCuenta} from "../../interfaces/cuenta";
import {MatDialog} from "@angular/material/dialog";
import {CuentasService} from "../../services/cuentas.service";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {EmpleadoCuentaService} from "../../services/empleado-cuenta.service";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {InsumosService} from "../../services/insumos.service";
import {IngresoService} from "../../services/ingreso.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import {FechaHoraService} from "../../utils/sharedMethods/fechasYHora/fecha-hora.service";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";
import {InsumoReservado, ValidarExistenciasService} from "../cuentas/validar-existencias.service";
import {LocalService} from "../../utils/sharedMethods/localStorage/local.service";
import {EMPTY, forkJoin, Observable, switchMap, tap} from "rxjs";
import {format} from "date-fns";
import {EmpleadoCuenta} from "../../interfaces/empleadoCuenta";
import {ModalCuentasComponent} from "../../utils/modal-cuentas/modal-cuentas.component";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {ModalEditarCuentaComponent} from "../../utils/modal-editar-cuenta/modal-editar-cuenta.component";
import Swal from "sweetalert2";
import {Ingreso} from "../../interfaces/ingreso";
import {Empleado} from "../../interfaces/empleado";
import {EmpleadosService} from "../../services/empleados.service";
import {ModalIngresosComponent} from "../../utils/modal-ingresos/modal-ingresos.component";

@Component({
  selector: 'app-cuentas-empleado',
  templateUrl: './cuentas-empleado.component.html',
  styleUrls: ['./cuentas-empleado.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class CuentasEmpleadoComponent  implements OnInit{
  //cuentas de empleado filtradas por fecha
  cuentasEmpleado : Cuenta[] = [];
  nombreEmpleado : string | null = this.localStorageService.getNombreApellidoUsuario();
  idEmpleado : string | null = sessionStorage.getItem("empleadoId");

  //datos recibidos del componente de calendario
  datosRecibidos! : { fromDate: Date | null, toDate : Date | null };

  //variables de fecha
  horaActual = this.fechaService.obtenerFechaHoraLocalActual();
  fechaHoraInicioUTC = this.fechaService.convertirFechaHoraLocalAUTC(this.horaActual);
  fechaHoraFinUTC : string | null = null;

  // Variable para el filtro de estados de cuenta
  filtrarEstado : string = '';
  //verificacion de sesion
  userLoginOn! : boolean;

  //skeletonLoadingPartial
  isLoading = true;

  //metodo de pago
  //por defecto efectivo
  metodoDePagoSeleccionado = "Efectivo";
  ngOnInit(): void {
    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }else{
      this.cuentaService.refreshNeeded
        .subscribe(
          () =>{
            this.obtenerDatos()
          }
        );
      //obtener las cuentas del dia de hoy.
      this.obtenerDatos();
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
              public fechaService : FechaHoraService,
              private loginService : LoginService,
              private router : Router,
              private validarExistencias : ValidarExistenciasService,
              private localStorageService : LocalService,
              private empleadoService : EmpleadosService) {
  }


  //****************************
  //*******MÉTODOS*******
  //****************************


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
      this.isLoading = true;
      this.obtenerDatos();
    }
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************


  private obtenerDatos() {
    // Llamada a la API para obtener las cuentas por fecha
    const cuentasPorFecha$ = this.cuentaService.cuentasByEmpleado(this.idEmpleado,this.fechaHoraInicioUTC, this.fechaHoraFinUTC)
      .pipe(
        tap(data => {
          // Formatear la fecha y hora de cada cuenta
          data.object.forEach((cuenta: Cuenta)  => {
            const fechaArray: number[] = cuenta.fecha;
            const fecha: Date = new Date(
              fechaArray[0],
              fechaArray[1] - 1,
              fechaArray[2],
              fechaArray[3],
              fechaArray[4],
              fechaArray[5],
              fechaArray[6] / 1000000
            );
            cuenta.fecha = fecha;
          });
        })
      );

    this.isLoading = true;
    // Combinar ambas llamadas usando forkJoin
    forkJoin({
      cuentasPorFecha: cuentasPorFecha$
    }).subscribe(
      ({ cuentasPorFecha}) => {
        this.cuentasEmpleado = cuentasPorFecha.object;

      },
      error => {
        if (error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")) {
          this.loginService.logout();
          this.router.navigateByUrl("home/login");
          location.reload();
          const mensaje = "La sesión ha caducado.";
          this.alertaService.alertaErrorMensajeCustom(mensaje);
        } else {
          console.log(error);
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }


  //****************************
  //*******MODALES*******
  //****************************
  public modalCrearCuenta() : void{
    //obtener valores del local storage para saber si el dia esta iniciado y esta en la fecha correspondiente
    const estadoDia = JSON.parse(this.localStorageService.getData('estadoDia'));
    const fechaCaja = this.localStorageService.getData('fecha');
    const mensaje = "No se pueden crear cuentas sin haber iniciado el día."
    if(estadoDia && estadoDia){
      const fechaComparar = new Date(fechaCaja);
      const fechaActual = new Date();
      // Calcular la diferencia en milisegundos entre las fechas
      const diferenciaMilisegundos = Math.abs(fechaActual.getTime() - fechaComparar.getTime());
      // Convertir la diferencia de milisegundos a horas
      const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);

      // Definir el rango de 16 horas
      const rangoHoras = 16;
      if(estadoDia && diferenciaHoras <= rangoHoras){
        const dialogRef = this.dialog.open(ModalCuentasComponent,{
          width: '450px', // Ajusta el ancho según tus necesidades
          position: { right: '0' }, // Posiciona el modal a la derecha
          height: '600px',
        });

        dialogRef.afterClosed().subscribe(
          async result => {
            if (result) {
              // crear instancias
              //estado de la cuenta
              //todas las cuentas se crean con estado ::por despachar::
              const estadoCuenta: EstadoCuenta = {
                id: 1,
                nombre: "Por despachar"
              }
              //cuenta
              const cuenta: Cuenta = {
                id: 0,
                mesa: result.mesa,
                estadoCuenta: estadoCuenta,
                fecha: null,
                total: result.total,
                abono: 0
              }
              //Estancia de empleado por cuenta
              const empleadoCuenta: EmpleadoCuenta = {
                id: 0,
                cuenta: cuenta,
                empleado: result.empleado
              }
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
              }else{ //si no hay problema con los insumos, crea la cuenta.
                this.cuentaService.crearCuenta(cuenta)
                  .subscribe(
                    data=> {
                      //asignarle a la cuenta el id de la cuenta que ha sido recien creada
                      cuenta.id = data.object.id;
                      //CREAR PRODUCTOS POR CUENTA
                      for (let pc of productosCuenta){
                        this.productosCuentaService.crearProductoCuenta(pc)
                          .subscribe();
                      }
                      //CREAR EMPLEADO X CUENTA
                      this.empleadoCuentaService.crearEmpleadoCuenta(empleadoCuenta)
                        .subscribe();

                      //DEDUCIR LOS INSUMOS
                      if(insumosReservados){
                        insumosReservados.forEach(insumoR => {
                          insumoR.insumo.cantidad = insumoR.resultadoResta;
                          this.insumoService.actualizarInsumos(insumoR.insumo).subscribe();
                        })
                      }
                    },
                    error => {
                      console.log(error)
                    },
                    () => {
                      //una vez la solicitud se completa se muestra mensaje de creación exitosa
                      this.alertaService.alertaConfirmarCreacion();
                    }
                  );
              }
            }

          }
        )
      }else{
        this.alertaService.alertaErrorMensajeCustom(mensaje)
      }
    }else{
      this.alertaService.alertaErrorMensajeCustom(mensaje)
    }


  }

  //MODAL VER CUENTA Y/O EDITAR
  public async verCuenta(cuentaDTO: Cuenta) {
    let cuenta: Cuenta = {...cuentaDTO};

    cuenta = this.fechaService.restar5Horas(cuenta);

    let empleado: EmpleadoCuenta;
    const id = parseInt(this.idEmpleado!);
    const e = await this.empleadoService.getEmpleadoById(id).toPromise();
    empleado = {
      id : 0,
      cuenta: cuentaDTO,
      empleado : e.object
    }

    let productosCuenta: ProductoCuenta [] = [];

    this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id)
      .subscribe(
        data => {
          productosCuenta.push(data.object);
        }, error => {
          console.log(error)
        }
      );

    let datos = {}
    if (cuenta.estadoCuenta.nombre == 'Pagada' || cuenta.estadoCuenta.nombre == "Cancelada") {
      datos = {
        cuenta: cuenta,
        empleado: empleado,
        productos: productosCuenta,
        readOnly: true
      }
    } else {
      datos = {
        cuenta: cuenta,
        empleado: empleado,
        productos: productosCuenta,
      }
    }

    const dialogRef = this.dialog.open(ModalEditarCuentaComponent, {
      width: '450px', // Ajusta el ancho según tus necesidades
      position: {right: '0'}, // Posiciona el modal a la derecha
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
            try {
              const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id).toPromise();
              if (productosCuenta.object.length > 0) {
                // Mostrar alerta de confirmación para editar
                const result = await this.alertaService.alertaPedirConfirmacionEditar();

                if (result.isConfirmed) {
                  // Actualizar el estado de cada producto a "En preparación"
                  await Promise.all(productosCuenta.object.map(async (producto: ProductoCuenta) => {
                    producto.estado = "Despachado";
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
          //Cuando se va a mandar a preparar la cuenta
          else if (cuenta.estadoCuenta.id == 5) {
            try {

              const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(cuenta.id).toPromise();
              if (productosCuenta.object.length > 0) {
                //validar si vienen productos cuyo estado no es despachado
                //y guardarlos en otro array
                const productosCuentaPendientes: ProductoCuenta [] = []
                //seleccionar los productosCuenta que no han sido despachados ni estan en preparacion
                productosCuenta.object.forEach(
                  (productoCuenta: ProductoCuenta) => {
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
                const productosCuenta: ProductoCuenta[] = productosCuentaResponse.object.filter((productoCuenta: ProductoCuenta) => {
                  const estado = productoCuenta.estado
                  return estado == 'Por despachar';
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
            if (insuficientes) {
              let mensaje = `<h3>Insumos insuficientes</h3>`;
              insumosReservados.forEach(insumoR => {
                if (insumoR.resultadoResta < 0) {
                  mensaje += `<h4>Producto: ${insumoR.producto}, Insumo: ${insumoR.insumo.nombre}, Existencias: ${insumoR.insumo.cantidad}, Cantidad a deducir: ${insumoR.cantidadARestar}</h4>`
                }
                this.alertaService.alertaErrorMensajeCustom(mensaje)
              })
            } else {

              //DEDUCIR LOS INSUMOS
              if (insumosReservados) {
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
                  data => {
                  },
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
