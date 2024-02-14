import {Component, OnInit} from '@angular/core';
import {InsumosService} from "../../services/insumos.service";
import {insumo} from "../../interfaces";

import {MatDialog} from "@angular/material/dialog";
import {ModalInsumosComponent} from "../../utils/modal-insumos/modal-insumos.component";
import Swal from "sweetalert2";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";


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
  nombreEditado : string = '';
  //verificacion de sesion
  userLoginOn : boolean = false;

  constructor(private insumosService : InsumosService,
              public dialog : MatDialog,
              private loginService : LoginService,
              private router : Router,
              private alertaService : AlertasService
  ) {

  }
  ngOnInit(): void{
    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }else{
      this.insumosService.refreshNeeded
        .subscribe(
          () =>{
            this.getAllInsumos();
          }
        );
      this.getAllInsumos();
    }

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
      height: '450px'
    });
    //cerrar modal y realizar una acción, en este caso crear un insumo
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const insumo : insumo = {
          id: 0,
          nombre: result.nombre,
          cantidad: result.cantidad
        };
        this.nuevoInsumo(insumo);
      }
    });
  }

  /*
  * fin metodos modal
  * */

  public setIsNombreBusqueda(valor : boolean) :void{
    this.isNombreBusqueda = valor;
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
    this.nombreEditado = this.insumos[index].nombre;
  }
  public guardarEdicion(index : number){
    let dato : insumo = this.insumos[index];
    dato.cantidad = this.cantidadEditada;
    dato.nombre = this.nombreEditado;
    this.insumosService.actualizarInsumos(dato)
      .subscribe();
    this.cancelarEdicion();
  }
  cancelarEdicion(){
    this.modoEdicion = false;
    this.cantidadEditada = 0;
    this.nombreEditado = '';
    this.insumoEditandoIndex = null;
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  public nuevoInsumo(insumo : insumo){
    this.insumosService.crearInsumo(insumo)
      .subscribe(
        (response) =>{
          this.alertaConfirmacionGuardar()
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
          if(error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")){
            this.loginService.logout(); //quitar todas las credenciales de sesion
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          }else{
            console.log(error)
          }
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


  //ALERTAS / TESTING

  //alerta cuando se guarda o se modifica un insumo
  public alertaConfirmacionGuardar() {
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "Insumo guardado exitosamente!",
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      position: 'center', // Esquina inferior derecha
      showConfirmButton: false, // Ocultar el botón de confirmación
      background: '#1e1e1e', // Fondo oscuro
      didOpen: () => {
        Swal.showLoading();
        // @ts-ignore
        const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
        timerInterval = setInterval(() => {
        }, 200);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      // Lógica adicional después de cerrar la alerta
    });
  }

  //alerta de confirmación para eliminar un insumo
  public alertaConfirmarEliminar(id : number){

    // @ts-ignore
    Swal.fire({
      title: "¿Estas seguro de eliminar este insumo?",
      text: "No podrás revertir esta acción!",
      icon:"warning",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar insumo",
      cancelButtonText:"Cancelar",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    }).then(
      (result) => {
        //ACCION A REALIZAR EN CASO DE QUE SE DESEE PROSEGUIR CON
        // LA ELIMINACION
        if(result.isConfirmed){
          //eliminar el insumo con el id asociado
          this.deleteInsumo(id);

          let timerInterval: any;
          // @ts-ignore
          Swal.fire({
            title: "Se ha eliminado el insumo correctamente.",
            icon: 'success',
            timer: 2000,
            color: "#fff",
            timerProgressBar: true,
            position: 'center', // Esquina inferior derecha
            showConfirmButton: false, // Ocultar el botón de confirmación
            background: '#1e1e1e', // Fondo oscuro
            didOpen: () => {
              Swal.showLoading();
              // @ts-ignore
              const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
              timerInterval = setInterval(() => {
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            }
          });

        }
        //ACCION A REALIZAR SI SE CANCELA LA ACCION
        else if(result.dismiss === Swal.DismissReason.cancel ){
          let timerInterval: any;
          // @ts-ignore
          Swal.fire({
            title: "No se ha realizado ningún cambio en el insumo.",
            icon: 'error',
            timer: 2000,
            color: "#fff",
            timerProgressBar: true,
            position: 'center', // Esquina inferior derecha
            showConfirmButton: false, // Ocultar el botón de confirmación
            background: '#1e1e1e', // Fondo oscuro
            didOpen: () => {
              Swal.showLoading();
              // @ts-ignore
              const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
              timerInterval = setInterval(() => {
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            }
          });

        }
      }
    )
  }


  //ALERTA AL EDITAR UN INSUMO
  public alertaConfirmarEditar(id : number){

    // @ts-ignore
    Swal.fire({
      title: "¿Estas seguro de editar las existencias de este insumo?",
      icon:"warning",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, actualizar insumo",
      cancelButtonText:"Cancelar",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    }).then(
      (result) => {
        //ACCION A REALIZAR EN CASO DE QUE SE DESEE PROSEGUIR CON
        // LA Edicion
        if(result.isConfirmed){

          //guardar insumo editado
          this.guardarEdicion(id);

          let timerInterval: any;
          // @ts-ignore
          Swal.fire({
            title: "Se ha actualizado el insumo correctamente.",
            icon: 'success',
            timer: 2000,
            color: "#fff",
            timerProgressBar: true,
            position: 'center', // Esquina inferior derecha
            showConfirmButton: false, // Ocultar el botón de confirmación
            background: '#1e1e1e', // Fondo oscuro
            didOpen: () => {
              Swal.showLoading();
              // @ts-ignore
              const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
              timerInterval = setInterval(() => {
              }, 200);
            },
            willClose: () => {
              clearInterval(timerInterval);
            }
          });

        }
        //ACCION A REALIZAR SI SE CANCELA LA ACCION
        else if(result.dismiss === Swal.DismissReason.cancel ){
          let timerInterval: any;
          //cancelar edidion
          this.cancelarEdicion();
          // @ts-ignore
          Swal.fire({
            title: "No se ha realizado ningún cambio en el insumo.",
            icon: 'error',
            timer: 2000,
            color: "#fff",
            timerProgressBar: true,
            position: 'center', // Esquina inferior derecha
            showConfirmButton: false, // Ocultar el botón de confirmación
            background: '#1e1e1e', // Fondo oscuro
            didOpen: () => {
              Swal.showLoading();
              // @ts-ignore
              const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
              timerInterval = setInterval(() => {
              }, 200);
            },
            willClose: () => {
              clearInterval(timerInterval);
            }
          });

        }
      }
    )
  }
}
