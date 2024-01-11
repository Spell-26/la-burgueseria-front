import {Component, OnInit} from '@angular/core';
import {Mesa} from "../../interfaces";
import {MesasService} from "../../services/mesas.service";
import {MatDialog} from "@angular/material/dialog";
import {Validators} from "@angular/forms";
import {ModalLateralComponent} from "../../utils/modal-lateral/modal-lateral.component";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class MesasComponent implements OnInit{
  public mesas : Mesa[] = []
  public nombreBusqueda : number | null = null;
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
  mesaEditandoIndex : number | null = null;
  estadosMesa = ['Disponible', 'Deshabilitada'] //'Ocupada' se hace automaticamente cuando se asigna una cuenta
  nuevoEstadoMesa : string = "";
  nuevoNumeroMesa : number = 0;

  constructor(private mesaService : MesasService, public dialog : MatDialog,
              private alertaService : AlertasService
  ) {
  }
  ngOnInit(): void {
    this.mesaService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllMesas();
        }
      );
    this.getAllMesas();
  }


  //****************************
  //*******MÉTODOS*******
  //****************************

  //proxima pagina
  public  nextPage(){
    this.pagina+=1;
    this.getAllMesas();
  }

  //pagina anterior
  public  previousPage(){
    this.pagina-=1;
    this.getAllMesas();
  }

  public iniciarEdicion(index :number):void {
    this.modoEdicion = true;
    this.mesaEditandoIndex = index;
    this.nuevoEstadoMesa = this.mesas[index].estado;
    this.nuevoNumeroMesa = this.mesas[index].numeroMesa;
  }
  cancelarEdicion(){
    this.modoEdicion = false;
    this.mesaEditandoIndex = null;
    this.nuevoNumeroMesa = 0;
    this.nuevoEstadoMesa = "";
  }
  onEstadoSeleccionadoChance(){

  }
  guardarEdicion(index : number){

    if(this.nuevoEstadoMesa != "" && this.nuevoNumeroMesa != null){
      const mesa : Mesa = {
        id: index,
        numeroMesa: this.nuevoNumeroMesa,
        estado: this.nuevoEstadoMesa,
        qr: null
      };

      this.alertaService.alertaPedirConfirmacionEditar()
        .then(
          (result) => {
            if(result.isConfirmed){
              this.alertaService.alertaConfirmarCreacion();
              this.mesaService.actualizarMesa(mesa)
                .subscribe();
            }else if(result.dismiss === Swal.DismissReason.cancel ){
              this.alertaService.alertaSinModificaciones();
            }
          }
        )

      this.cancelarEdicion();



    }

  }


  public setIsNombreBusqueda(valor : boolean) :void{
    this.isNombreBusqueda = valor;
  }
  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  private getAllMesas(){
    this.mesaService.getMesasPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data =>{
          this.mesas = data.content;
          this.isFirst = data.first;
          this.isLast = data.last;
        },
        error => {
          console.log(error.error())
        }
      )
  }

  //eliminar mesa
  public deleteMesa(id : number) : void{

    this.alertaService.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){
            this.alertaService.alertaEliminadoCorrectamente();
            this.mesaService.deleteMesa(id)
              .subscribe();
          }else if(result.dismiss === Swal.DismissReason.cancel ){
            this.alertaService.alertaSinModificaciones();
          }
        }
      )

  }

  //crear mesa
  public createMesa(mesa : Mesa){
    return this.mesaService.createMesa(mesa);
  }


  //buscar por numero de mesa
  public buscarMesas(){
    if(this.nombreBusqueda == null){
      this.setIsNombreBusqueda(false);
      this.getAllMesas();
    }else{
      this.mesaService.buscarPorNumeroMesa(this.nombreBusqueda)
        .subscribe(
          mesa =>{
            this.mesas = mesa.object
          }
        );
      this.setIsNombreBusqueda(true);
    }
  }

  //****************************
  //*******MODALES*******
  //****************************

  //MODAL CREAR MESA
  public crearMesaModal() :void{
    const camposMesas = [
      { nombre : 'numero', label:'Número de mesa', tipo: 'number', validadores: [Validators.required, Validators.pattern(/^[0-9]+$/)]}
    ];

    //ajustes del modal
    const dialogRef = this.dialog.open(ModalLateralComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: {campos: camposMesas, titulo: 'Nueva Mesa'}
    });

    dialogRef.afterClosed().subscribe(
      result =>{
        //estancia del objeto mesa
        const mesa : Mesa = {
          id: 0,
          numeroMesa: result.numero,
          estado : "Disponible",
          qr : null
        };

        this.createMesa(mesa)
          .subscribe(
            respuesta =>{
              this.alertaService.alertaConfirmarCreacion()
            },
            error => {
              console.log(error)
            }
          )
      }
    )
  }
}
