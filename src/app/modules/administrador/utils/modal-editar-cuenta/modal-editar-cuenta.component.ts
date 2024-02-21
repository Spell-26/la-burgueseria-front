import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {Cuenta} from "../../interfaces/cuenta";
import {EmpleadoCuenta} from "../../interfaces/empleadoCuenta";
import {ProductosCuentaService} from "../../services/productos-cuenta.service";
import {ModalAddProductoComponent} from "../modal-add-producto/modal-add-producto.component";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";
import {CuentasService} from "../../services/cuentas.service";


interface ProductoDeCuenta {
  cantidad: number;
  obj:      Obj;
}

interface Obj {
  categoriaProducto: CategoriaProducto;
  descripcion:       string;
  id:                number;
  imagen:            string;
  nombre:            string;
  precio:            number;
}

interface CategoriaProducto {
  id:     number;
  nombre: string;
}

@Component({
  selector: 'app-modal-editar-cuenta',
  templateUrl: './modal-editar-cuenta.component.html',
  styleUrls: ['./modal-editar-cuenta.component.css']
})
export class ModalEditarCuentaComponent implements OnInit{
  form: FormGroup;
  //valores de la cuenta
  empleadoData : EmpleadoCuenta | null = null;
  cuentaData : Cuenta | null = null
  cuentaProductosData : ProductoCuenta[]  = [];
  cuentaProductosAgg : ProductoDeCuenta[] = [];
  abonoData : number = 0;
  //TOTAL
  totalCuenta : number = 0;

  //tests
  // Debes inicializarla con el id del estado actual o null
  estadoSeleccionado: number | undefined ;
  //saber cuando el modal es solo lectura
  isReadOnly : boolean = false;
  //variable del timer de cancelar cuenta
  private pressTimer: any;
  public isPressed: boolean = false;
  //variable para verificar carga de datos
  isLoading : boolean = true;
  ngOnInit(): void {
    this.obtenerProductos();
    //asignar el valor del id del estado
    this.estadoSeleccionado = this.cuentaData?.estadoCuenta?.id;
  }

  constructor(
    public dialogRef: MatDialogRef<ModalEditarCuentaComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any,
    private fb : FormBuilder,
    private productoCuentaService : ProductosCuentaService,
    public dialog : MatDialog,
    private cdr: ChangeDetectorRef,
    private alertaService : AlertasService,
    private cuentaService : CuentasService
  ) {

    if(data){
      this.empleadoData = data.empleado;
      this.cuentaData = data.cuenta;
      if(data.cuenta.abono > 0){
        this.abonoData = data.cuenta.abono;
      }
      if(data.readOnly){
        this.isReadOnly = data.readOnly
      }
    }

    this.form = this.fb.group({
      empleado : [null, Validators.required],
      mesa : [null, Validators.required],
    });

    this.form.get('empleado')?.disable();
    this.form.get('mesa')?.disable();
  }

  //METODOS
  public formatearNumeroConPuntos(numero: number | undefined) {
    // Usa la función toLocaleString para formatear el número con separadores de miles
    if(numero){
      return numero.toLocaleString();
    }
    else {
      return null;
    }
  }

  quitarProducto(producto: Obj): void {
    this.cuentaProductosAgg = this.cuentaProductosAgg.filter(p => p.obj.id !== producto.id);
    this.calcularTotal();
    if(this.cuentaProductosAgg.length == 0){
      this.estadoSeleccionado = this.cuentaData?.estadoCuenta.id;
    }
  }

  private calcularTotal(){
    let total = 0;
    if(this.cuentaProductosAgg.length > 0){
      this.cuentaProductosAgg.forEach(producto => {
        total += producto.cantidad * producto.obj.precio
      });
    }
    if(this.cuentaProductosData.length > 0){
      this.cuentaProductosData.forEach(producto => {
        total += producto.cantidad * producto.producto.precio;
      })
    }
    this.totalCuenta = total;
  }

  // Método para manejar el inicio del temporizador
  onButtonPress(timeOut : number, action : string) {
    this.isPressed = true;
    this.pressTimer = setTimeout(() => {
      this.startAction(action);
    }, timeOut);
  }
  // Método para manejar el fin del temporizador si el botón es liberado antes de los 3 segundos
  onButtonRelease() {
    clearTimeout(this.pressTimer);
    this.isPressed = false;
  }

  // Método para iniciar la acción después de los 3 segundos
  private startAction(action : string) {
    if(action === "Cancelar"){
      this.estadoSeleccionado = 4; // id del estado cancelado
      this.onSubmit();
    }
    else if( action === "Cambiar estado"){
      switch (this.cuentaData?.estadoCuenta?.id){
        case 1: //cuando esta en estado Por despachar
          this.estadoSeleccionado = 5; //se cambia a En preparacion
          this.onSubmit();
          break;
        case 5: //cuando esta en preparación
          this.estadoSeleccionado = 3; //Se cambia a Despachada
          this.onSubmit();
          break;
        case 3: //Cuando esta despachada
          this.estadoSeleccionado = 2; // Se cambia a pagada
          this.onSubmit();
          break;
      }
    }
    this.isPressed = false;
  }
  private obtenerProductos(){
    this.isLoading = true;
    this.productoCuentaService.getProductoCuentaByCuentaId(this.data.cuenta.id)
      .subscribe(
        result => {
          this.cuentaProductosData = result.object;
          this.cdr.detectChanges(); // Forzar la detección de cambios
          this.calcularTotal();
        },
        error => {
          console.log(error);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  eliminarProductoCuenta(id : number){

    this.alertaService.alertaConfirmarEliminar()
      .then(
        result => {
          if(result.isConfirmed){
            this.productoCuentaService.eliminarProductoCuenta(id).subscribe(
              async () => {
                this.calcularTotal();
                this.obtenerProductos();
              },
              error => {
                console.log(error)
              },
              () => {

              }
            );
          }
        }
      )
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(): void {

    let cuenta : Cuenta | null = this.cuentaData;

    if(cuenta != null){
      cuenta.total = this.totalCuenta;
      cuenta.abono = this.abonoData;
      if (this.estadoSeleccionado != null) {
        cuenta.estadoCuenta.id = this.estadoSeleccionado
      }
    }

    const datosAEnviar = {
      productos : this.cuentaProductosAgg,
      cuenta : cuenta
    }

    this.dialogRef.close(datosAEnviar);
  }



  //MODAL ADD PRODUCTOS
  modalAgregarProducto(){
    const dialogRef = this.dialog.open(ModalAddProductoComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '350px',
    });
    dialogRef.afterClosed().subscribe(
      result =>{
        console.log(result)
        const object : ProductoDeCuenta = {
          obj: result.producto,
          cantidad: result.cantidad
        }

        this.cuentaProductosAgg.push(object);

        this.calcularTotal();
        //cambia a estado 1 (por despachar)
        this.estadoSeleccionado = 1;
      }
    )
  }


}
