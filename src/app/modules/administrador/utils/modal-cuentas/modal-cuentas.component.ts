import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EmpleadosService} from "../../services/empleados.service";
import {MesasService} from "../../services/mesas.service";
import {Empleado} from "../../interfaces/empleado";
import {Mesa, Producto} from "../../interfaces";
import {ModalAddProductoComponent} from "../modal-add-producto/modal-add-producto.component";


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
  selector: 'app-modal-cuentas',
  templateUrl: './modal-cuentas.component.html',
  styleUrls: ['./modal-cuentas.component.css']
})
export class ModalCuentasComponent implements OnInit{


  form: FormGroup;
  empleados : Empleado[] = [];
  mesas : Mesa[] = [];
  //filtrar mesas disponibles y empleados activos
  empleadosActivos : Empleado[] = [];
  mesasDisponibles : Mesa[] = [];
  //productos seleccionados
  productosCuenta : ProductoDeCuenta[] = [];
  //total de la cuenta
  totalCuenta = 0;
  //mesa y empleado seleccionado
  empleadoSeleccionado : Empleado | undefined;
  mesaSeleccionada : Mesa | undefined;

  constructor(
    public dialogRef: MatDialogRef<ModalCuentasComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any,
    private fb : FormBuilder,
    private empleadoService : EmpleadosService,
    private mesaService : MesasService,
    public dialog : MatDialog
  ) {
    this.form = this.fb.group({
      empleado : [null, Validators.required],
      mesa : [null, Validators.required],
    })
  }

  ngOnInit(): void {
    this.getEmpleados();
    this.getMesas();

  }

  /*
  *
  * METODOS
  * */
  onEmpleadoSeleccionado(event: { value: any; }): void {
    const empleadoId = event.value;
    this.empleadoSeleccionado = this.empleados.find(empleado => empleado.id === empleadoId.id);
  }

  onMesaSeleccionada(event: any): void {
    const mesaSelect = event.source.value;
    this.mesaSeleccionada = this.mesasDisponibles.find(mesa => mesa.id === mesaSelect.id);
  }

  quitarProducto(producto: Obj): void {
    this.productosCuenta = this.productosCuenta.filter(p => p.obj.id !== producto.id);
    this.calcularTotal();
  }


  private calcularTotal(){
    let total = 0;
    this.productosCuenta.forEach(producto => {
      total += producto.cantidad * producto.obj.precio
    });
    this.totalCuenta = total;
  }

  public formatearNumeroConPuntos(numero: number): string {
    // Usa la función toLocaleString para formatear el número con separadores de miles
    return numero.toLocaleString();
  }
  /*
  * PETICIONES HTTP
  *
  * */

  private getEmpleados(){
    this.empleadoService.getEmpleados()
      .subscribe(
        data =>{
          this.empleados = data.object
          //filtrar por empleado activo
          this.empleados.forEach( empleado => {
            if (empleado.estado) {
              this.empleadosActivos.push(empleado)
            }
          })
        },
        error =>{
          console.log(error)
        }
      )
  }
  private getMesas(){
    this.mesaService.getMesas()
      .subscribe(
        data =>{
          this.mesas = data.object;
          //obtener mesas habilitadas
          this.mesas.forEach(mesa =>{
            if(mesa.estado != "Deshabilitada"){
              this.mesasDisponibles.push(mesa);
            }
          })
        },
        error =>{
          console.log(error)
        }
      )
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {

      const datosAEnviar = {
        productos : this.productosCuenta,
        total : this.totalCuenta,
        empleado : this.empleadoSeleccionado,
        mesa : this.mesaSeleccionada
      }

      this.dialogRef.close(datosAEnviar);
    }
  }

  /*
  *
  * MODALES
  * */
  modalAgregarProducto(){
    const dialogRef = this.dialog.open(ModalAddProductoComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '350px',
    });
    dialogRef.afterClosed().subscribe(
      result =>{
        if(result){
          const object : ProductoDeCuenta = {
            obj: result.producto,
            cantidad: result.cantidad
          }

          this.productosCuenta.push(object);

          this.calcularTotal();
        }
      }
    )
  }
}
