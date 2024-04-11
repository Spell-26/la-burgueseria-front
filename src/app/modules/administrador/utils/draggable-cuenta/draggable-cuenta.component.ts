import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Cuenta } from "../../interfaces/cuenta";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {ValidarExistenciasService} from "../../components/cuentas/validar-existencias.service";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";
import {InsumosService} from "../../services/insumos.service";
import {CuentasService} from "../../services/cuentas.service";
import Swal from "sweetalert2";
import {async, EMPTY, Observable, switchMap} from "rxjs";
import {FechaHoraService} from "../sharedMethods/fechasYHora/fecha-hora.service";
import {Ingreso} from "../../interfaces/ingreso";
import {ModalIngresosComponent} from "../modal-ingresos/modal-ingresos.component";
import {MatDialog} from "@angular/material/dialog";
import {IngresoService} from "../../services/ingreso.service";
import {MesasService} from "../../services/mesas.service";

@Component({
  selector: 'app-draggable-cuenta',
  templateUrl: './draggable-cuenta.component.html',
  styleUrls: ['./draggable-cuenta.component.css',  '../styles/estilosCompartidos.css', '../../components/cuentas/cuentas.component.css']
})
export class DraggableCuentaComponent implements OnInit {
  @ViewChild('innerContainer', { static: true }) innerContainerRef!: ElementRef<HTMLDivElement>;
  @Input() cuenta!:Cuenta;
  @Input() nombreEmpleado!: String;

  startX: number = 0;
  startY : number = 0;
  containerWidth: number = 0;
  containerHeight: number = 0;
  isDragging: boolean = false;
  thresholdPercentage: number = 30;
  colorFondo: string = 'black';


  constructor(private productosCuentaService : ProductosCuentaService,
              private validarExistencias : ValidarExistenciasService,
              private alertaService : AlertasService,
              private insumoService : InsumosService,
              private cuentaService : CuentasService,
              private fechaService : FechaHoraService,
              public dialog : MatDialog,
              private ingresoService: IngresoService,
              private mesaService : MesasService) { }

  ngOnInit() {
    this.containerWidth = this.innerContainerRef.nativeElement.getBoundingClientRect().width;
    this.containerHeight = this.innerContainerRef.nativeElement.getBoundingClientRect().height;
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('touchmove', this.drag);
    document.addEventListener('mouseup', this.endDrag);
    document.addEventListener('touchend', this.endDrag);
  }

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.startY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
  }

  drag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;

    // Verificar si el estado de la cuenta es "Pagada" o "Cancelada"
    if (this.cuenta.estadoCuenta.nombre === 'Pagada' || this.cuenta.estadoCuenta.nombre === 'Cancelada') {
      return; // No hacer nada si el estado es "Pagada" o "Cancelada"
    }

    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const currentY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    const offsetX = currentX - this.startX;
    const offsetY = currentY - this.startY;

    const absOffsetX = Math.abs(offsetX);
    const absOffsetY = Math.abs(offsetY);

    // Verifica si el movimiento es principalmente horizontal o vertical
    if (absOffsetX > absOffsetY && absOffsetX > 5) {
      // Movimiento horizontal significativo, bloquea el evento predeterminado
      event.preventDefault();
    }

    const maxOffsetX = this.containerWidth * this.thresholdPercentage / 100;
    if (offsetX > maxOffsetX + 100) {
      event.stopPropagation();
      return;
    }

    if (offsetX >= maxOffsetX) {
      this.colorFondo = 'green';
    } else {
      this.colorFondo = 'black';
    }

    if (offsetX < 0) return;

    this.innerContainerRef.nativeElement.style.transform = `translateX(${offsetX}px)`;
  }

  endDrag = async () => {
    if (!this.isDragging) return;
    this.isDragging = false;

    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('touchmove', this.drag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchend', this.endDrag);

    const transformValue = this.innerContainerRef.nativeElement.style.transform;
    const transformArray = transformValue.split('(')[1].split('px')[0].split(', ');
    const offsetX = parseFloat(transformArray[0]);

    this.innerContainerRef.nativeElement.style.transform = 'translateX(0)';

    const maxOffsetX = this.containerWidth * this.thresholdPercentage / 100;

    if (offsetX >= maxOffsetX) {
      switch (this.cuenta.estadoCuenta.nombre) {
        case ("Por despachar"):
          try {
            this.cuenta.estadoCuenta.id = 5; // id de estado En preparación
            const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(this.cuenta.id).toPromise();
            this.cuenta  = this.fechaService.restar5Horas(this.cuenta);
            if (productosCuenta.object.length > 0) {


                // Mostrar alerta de confirmación para editar
                const result = await this.alertaService.alertaPedirConfirmacionEditar();

                if (result.isConfirmed) {
                  const productosCuentaPendientes: ProductoCuenta [] = []
                  productosCuenta.object.forEach(
                    (productoCuenta : ProductoCuenta) => {
                      if (productoCuenta.estado === 'Por despachar') {
                        productosCuentaPendientes.push(productoCuenta);
                      }
                    }
                  );
                  // Actualizar el estado de cada producto a "En preparación"
                  await Promise.all(productosCuentaPendientes.map(async (producto: ProductoCuenta) => {
                    producto.estado = "En preparación";
                    await this.productosCuentaService.actualizarProductoCuenta(producto).toPromise();
                  }));

                  // Actualizar la cuenta
                  await this.cuentaService.actualizarCuenta(this.cuenta).toPromise();

                  // Mostrar alerta de actualización exitosa
                  this.alertaService.alertaConfirmarCreacion();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  this.alertaService.alertaSinModificaciones();
                }
            }
          } catch (error) {
            console.error("Error al procesar la cuenta:", error);
          }

          break;

        case("En preparación"):
          try {
            this.cuenta.estadoCuenta.id = 3; //id de estado Despachada
            const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(this.cuenta.id).toPromise();
            this.cuenta  = this.fechaService.restar5Horas(this.cuenta);
            if (productosCuenta.object.length > 0){
              // Mostrar alerta de confirmación para editar
              const result = await this.alertaService.alertaPedirConfirmacionEditar();

              if (result.isConfirmed) {
                // Actualizar el estado de cada producto a "En preparación"
                let prodCuenta : ProductoCuenta[] = productosCuenta.object;
                prodCuenta.forEach(pc => {
                  if(pc.estado === "En preparación"){
                    this.productosCuentaService.actualizarProductoCuenta(pc).subscribe();
                  }
                })

                // Actualizar la cuenta
                await this.cuentaService.actualizarCuenta(this.cuenta).toPromise();

                // Mostrar alerta de actualización exitosa
                this.alertaService.alertaConfirmarCreacion();
              }else if (result.dismiss === Swal.DismissReason.cancel) {
                this.alertaService.alertaSinModificaciones();
              }
            }
          }catch (error) {
            console.error("Error al procesar la cuenta:", error);
          }

          break;
        case("Despachada"):

          try{
            this.cuenta.estadoCuenta.id = 2; //id de estado pagada
            //crear instancia de ingreso
            const ingreso : Ingreso = {
              id : 0,
              fecha : null,
              metodoPago : "Efectivo",
              total: this.cuenta.total,
              cuenta: this.cuenta
            }
            const productosCuenta = await this.productosCuentaService.getProductoCuentaByCuentaId(this.cuenta.id).toPromise();
            //ABRIR MODAL PARA SABER EL TIPO DE MÉTODO DE PAGO
            // GUARDAR INGRESO
            this.modalPagar(ingreso).subscribe(
              result => {
                if(result){
                  //ACTUALIZAR CUENTA
                  this.cuentaService.actualizarCuenta(this.cuenta)
                    .subscribe(
                      async data => {
                        const mesa = this.cuenta.mesa;
                        mesa.isOcupada = false;
                        this.mesaService.actualizarMesa(mesa).subscribe();
                        await Promise.all(productosCuenta.object.map(async (producto: ProductoCuenta) => {
                          producto.estado = "Pagado";
                          await this.productosCuentaService.actualizarProductoCuenta(producto).toPromise();
                        }));
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
              });
          }
          catch (error) {
            console.error("Error al procesar la cuenta:", error);
          }


          break;
      }

    }

    this.addEventListeners()
  }


  //modal pagar
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
