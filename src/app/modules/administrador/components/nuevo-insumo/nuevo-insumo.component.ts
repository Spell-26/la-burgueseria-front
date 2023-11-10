import {Component, OnInit} from '@angular/core';
import {insumoResponse, insumo} from "../../interfaces";
import {InsumosService} from "../../services/insumos.service";
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-nuevo-insumo',
  templateUrl: './nuevo-insumo.component.html',
  styleUrls: ['./nuevo-insumo.component.css']
})
export class NuevoInsumoComponent implements OnInit{

  //VARIABLES
  public insumos : any[] = []; //insumos consultados desde la api
  seleccionados : boolean[] = []; //los insumos seleccionados se muestran el en array de edicion
  public addedInsumos : any[] = []; //insumos seleccionados y pendientes para editar

  ngOnInit(): void {
    this.insumosService.refreshNeeded
      .subscribe(
        () => {
          this.getAllInsumos();
        }
      );
    this.getAllInsumos();


  }
  //*************************************
  //********** FUNCIONES ****************
  //*************************************

  //selector insumos
  seleccionar(index : number){
    this.seleccionados[index] = !this.seleccionados[index]
    //añadir insumos al array addedInsumos
    if(this.seleccionados[index]){
      this.addedInsumos.push(this.insumos[index])
    }else{
      this.addedInsumos = this.addedInsumos.filter((insumo, i) => i != index)
    }
    console.log(this.addedInsumos);
  }

  quitarUnitario(index: number){
    this.seleccionados[index] = !this.seleccionados[index];
    this.addedInsumos.splice(index,1);
    console.log(this.addedInsumos);
  }
  //funcion para el boton cancelar (quitar todos los insumos añadidos al area de edicion)
  quitarTodos(){
    for(let i =0; i < this.seleccionados.length; i++){
      if(this.seleccionados[i]){
       this.seleccionados[i] = !this.seleccionados[i];
       this.addedInsumos.splice(i, 1);
      }
    }
    console.log("Todos los insumos añadidos al area de edición han sido retirados")
  }
  //modal agregar insumo
  modalCrearInsumo(){
    Swal.fire({
      title:'Nuevo insumo',
      html: '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Cantidad" type="number">',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      showLoaderOnConfirm: true,

      preConfirm: (result) => {

        // @ts-ignore
        const nombre = Swal.getPopup().querySelector('#swal-input1').value;

        // @ts-ignore
        const cantidad = Swal.getPopup().querySelector('#swal-input2').value;

        if(!nombre || !cantidad){
          Swal.showValidationMessage('Por favor, completa todos los campos');
        }else{
          const insumo : insumo = {
            id : 0,
            nombre : nombre,
            cantidad : cantidad
          };
          //guardar el insumo
          this.insumosService.crearInsumo(insumo).subscribe(
            (respuesta) => {
              Swal.fire('Éxito', 'Insumo agregado correctamente', 'success');
            },
            (error) =>{
              Swal.fire('Error', 'Hubo un problema al agregar el insumo', 'error');
            }
          )
        }
      }
    })
  }

  //***************************************
  //*********** PETICIONES HTTP ***********
  //***************************************

  //constructor selecciona todos los insumos de la base de datos
  constructor(private insumosService : InsumosService) {

  }

  private getAllInsumos(){
    this.insumosService.getInsumos()
      .subscribe( insumo => {
        this.insumos = insumo.object;
        this.seleccionados  = new Array(this.insumos.length).fill(false);
      });
  }

  //guardar todos los insumos almacenados en el array addedInsumos
  public actualizarInsumos(){
    const datos = this.addedInsumos;

    const responses = this.insumosService.actualizarInsumos(datos);

    responses.forEach((respuesta, index) => {
      respuesta.subscribe((data) =>{
        this.quitarTodos();
        this.addedInsumos = [];
        console.log(`Respuesta ${index + 1}:`, data);
      })
    })
  }

}
