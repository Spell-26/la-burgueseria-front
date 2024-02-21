import {Component, OnInit} from '@angular/core';
import {Mesa} from "../../interfaces";
import {MesasService} from "../../services/mesas.service";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, Validators} from "@angular/forms";
import {ModalLateralComponent} from "../../utils/modal-lateral/modal-lateral.component";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";

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
  nuevoNumeroMesa  =  new FormControl(0, [Validators.required,  Validators.pattern(/^(0|[1-9]\d*)$/)]);
  //verificacion de sesion
  userLoginOn : boolean = false;
  //verificacion de carga de contenido
  isLoading = true;
  isLoadingPartial = false;

  constructor(private mesaService : MesasService, public dialog : MatDialog,
              private alertaService : AlertasService,
              private loginService : LoginService,
              private router : Router
  ) {
  }
  ngOnInit(): void {
    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }else{
      this.mesaService.refreshNeeded
        .subscribe(
          () =>{
            this.getAllMesas();
          }
        );
      this.getAllMesas();
    }

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
    this.nuevoNumeroMesa.setValue(this.mesas[index].numeroMesa) ;
  }
  cancelarEdicion(){
    this.modoEdicion = false;
    this.mesaEditandoIndex = null;
    this.nuevoNumeroMesa.setValue(0);
    this.nuevoEstadoMesa = "";
  }
  toggleMesaEstado(mesa : Mesa){
    if(mesa.estado == 'Disponible'){
      mesa.estado = 'Deshabilitada'
    }else{
      mesa.estado = 'Disponible';
    }
    this.mesaService.actualizarMesa(mesa).subscribe();
  }
  guardarEdicion(index : number){

    if(this.nuevoEstadoMesa != "" && this.nuevoNumeroMesa.value != null){
      const mesa : Mesa = {
        id: index,
        numeroMesa: this.nuevoNumeroMesa.value,
        estado: this.nuevoEstadoMesa,
        qr: null
      };

      this.alertaService.alertaPedirConfirmacionEditar()
        .then(
          (result) => {
            if(result.isConfirmed){
              this.alertaService.alertaConfirmarCreacion();
              this.mesaService.actualizarMesa(mesa)
                .subscribe(
                  result => {

                  }, error => {
                    if(error.status === 409){
                      //mostrar alerta con mensaje custom
                      const mensaje = "Ups! este número de mesa ya esta asignado a otra mesa, intenta con otro."
                      this.alertaService.alertaErrorMensajeCustom(mensaje);
                    }
                  }
                );

            }else if(result.dismiss === Swal.DismissReason.cancel ){
              this.alertaService.alertaSinModificaciones();
            }
          }
        )
      //volver el listado a su estado original
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
    this.isLoading = true;
    this.mesaService.getMesasPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data =>{
          this.mesas = data.content;
          this.isFirst = data.first;
          this.isLast = data.last;
        },
        error => {
          if(error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")){
            this.loginService.logout(); //quitar todas las credenciales de sesion
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          }else{
            console.log(error)
          }
        },
        () => {
          this.isLoading = false;
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
    this.isLoadingPartial = true;
    if(this.nombreBusqueda == null){
      this.setIsNombreBusqueda(false);
      this.getAllMesas();
      this.isLoadingPartial = false;
    }else{
      this.mesaService.buscarPorNumeroMesa(this.nombreBusqueda)
        .subscribe(
          mesa =>{
            this.mesas = mesa.object
          },
          error => {
            console.log(error)
          },
          () => {
            this.isLoadingPartial = false;
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
      height: '300px',
      data: {campos: camposMesas, titulo: 'Nueva Mesa'}
    });

    dialogRef.afterClosed().subscribe(
      result =>{
        if(result){
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
                if(error.status === 409){
                  //mostrar alerta con mensaje custom
                  const mensaje = "Ups! este número de mesa ya esta asignado a otra mesa, intenta con otro."
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }
              }
            )
        }
      }
    )
  }
}
