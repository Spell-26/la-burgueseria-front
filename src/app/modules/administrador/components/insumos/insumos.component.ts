import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {InsumosService} from "../../services/insumos.service";
import {insumo, InsumoPaginacion, insumoResponse} from "../../interfaces";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ModalInsumosComponent} from "../../utils/modal-insumos/modal-insumos.component";


@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class InsumosComponent implements OnInit{
  public insumos: Array<any> = [];
  public nombreBusqueda : string = "";
  public isNombreBusqueda : boolean = false;
  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;
  //variables para editar un insumo en especifico
  modoEdicion :boolean = false;
  cantidadEditada : number = 0;
  insumoEditandoIndex : number | null = null;

  constructor(private insumosService : InsumosService,
              public dialog : MatDialog
  ) {

  }
  ngOnInit(): void{

    this.insumosService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllInsumos();
        }
      );
    this.getAllInsumos();
  }

  //****************************
  //*******MÉTODOS*******
  //****************************

  /*
  *
  * metodos modal
  * */
  //abrir modal vinculado a este componente
  openDialog(): void {
    const dialogRef = this.dialog.open(ModalInsumosComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px'
    });
    //cerrar modal y realizar una acción, en este caso crear un insumo
    dialogRef.afterClosed().subscribe(result => {
      const insumo : insumo = {
        id: 0,
        nombre: result.nombre,
        cantidad: result.cantidad
      };
      this.nuevoInsumo(insumo);
    });
  }

  /*
  * fin metodos modal
  * */

  public setIsNombreBusqueda(valor : boolean) :void{
    this.isNombreBusqueda = valor;
  }
  public limpiarBusqueda(){
    this.isNombreBusqueda = false;
    this.getAllInsumos();
    this.nombreBusqueda ="";
  }
  public  nextPage(){
    this.pagina+=1;
    this.getAllInsumos();
  }
  public  previousPage(){
    this.pagina-=1;
    this.getAllInsumos();
  }

  public iniciarEdicion(index :number){
    this.modoEdicion = true;
    this.insumoEditandoIndex = index;
    this.cantidadEditada = this.insumos[index].cantidad;
  }
  public guardarEdicion(index : number){
    let dato : insumo = this.insumos[index];
    dato.cantidad = this.cantidadEditada;
    this.insumosService.actualizarInsumos(dato)
      .subscribe();
    this.cancelarEdicion();
  }
  cancelarEdicion(){
    this.modoEdicion = false;
    this.cantidadEditada = 0;
    this.insumoEditandoIndex = null;
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  public nuevoInsumo(insumo : insumo){
    this.insumosService.crearInsumo(insumo)
      .subscribe(
        (response) =>{
          console.log(response)
        },
        error => {
          console.log(error.error())
        }
      );
  }

  public deleteInsumo( id : number ):void{
    this.insumosService.deleteInsumo(id)
      .subscribe();
  }

  private getAllInsumos(){
    this.insumosService.getInsumosPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.insumos = data.content;
          this.isFirst = data.first;
          this.isLast = data.last;
        },
        error => {
          console.log(error.error())
        }
      );

  }
  public buscarInsumos(){
    if(this.nombreBusqueda.length == 0){
      this.setIsNombreBusqueda(false);
      this.getAllInsumos();
    }else{
      this.insumosService.buscarPorNombre(this.nombreBusqueda)
        .subscribe(insumo =>{
          this.insumos = insumo.object;
        });
      this.setIsNombreBusqueda(true);
    }

  }

  public actualizarInsumo(dato: insumo){
    this.insumosService.actualizarInsumos(dato);
  }

}
