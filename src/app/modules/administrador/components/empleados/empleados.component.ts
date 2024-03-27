import {Component, OnInit} from '@angular/core';
import {Empleado} from "../../interfaces/empleado";
import {EmpleadosService} from "../../services/empleados.service";
import {MatDialog} from "@angular/material/dialog";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";
import {ModalEmpleadoComponent} from "../../utils/modal-empleado/modal-empleado.component";
import {UserRegister} from "../../interfaces/usuario";
import {RegisterService} from "../../../home/services/auth/register.service";
import {forkJoin} from "rxjs";
import {UsuarioService} from "../../../home/services/usuario/usuario.service";


@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css',  '../../utils/styles/estilosCompartidos.css']
})
export class EmpleadosComponent implements OnInit{
  public empleados : Empleado[] = [];
  public nombreBusqueda?: string ;
  public isNombreBusqueda : boolean = false;

  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;

  //datos para la edicion
  documentoEmpleado : string  = "";
  nombreEmpleado : string = "";
  apellidoEmpleado : string = "";
//verificacion de sesion
  userLoginOn : boolean = false;
  //mostrar skeleton loading
  isSkeletonLoading : boolean = true;
  isPartialLoading : boolean = false;
  //usuario y empleado
  usuariosConEmpleados : any[] = [];

  //CONSTRUCTOR
  constructor(private empleadoService : EmpleadosService, public dialog : MatDialog,
              private alertaService : AlertasService,
              private loginService : LoginService,
              private router : Router,
              private registerService : RegisterService,
              private usuarioService : UsuarioService,
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
      this.empleadoService.refreshNeeded
        .subscribe(
          () => {
            this.getAllEmpleados();
            this.getEmpleadosUsuarios()
          }
        );
      this.registerService.refreshNeeded
        .subscribe(
          () => {
            this.getAllEmpleados();
            this.getEmpleadosUsuarios();
          }
        );
      this.usuarioService.refreshNeeded
        .subscribe(
          () => {
            this.getAllEmpleados();
            this.getEmpleadosUsuarios();
          }
        )
      this.getAllEmpleados();
      this.getEmpleadosUsuarios()
    }

  }


  //****************************
  //*******MÉTODOS*******
  //****************************



  //buscar empleados por nombre
  public buscarEmpleados() : void {
    if(this.nombreBusqueda == null || this.nombreBusqueda == ""){
      this.isNombreBusqueda = false;
      this.getAllEmpleados();
    }else{
      this.buscarEmpleadoPorNombre(this.nombreBusqueda);
      this.isNombreBusqueda = true;
    }
  }
  //cambiar estado de empleado con el slide
  public toggleEmpleadoEstado(empleado : Empleado){
    empleado.estado = !empleado.estado

    const titulo: string = "Deseas cambiar el estado de este empleado?";

    this.alertaService.alertaPedirConfirmacionMensajeCustom(titulo, '', '#fff')
      .then(
        (result) => {
          if(result.isConfirmed){
            //enviar a la base de datos los cambios
            this.actualizarEmpleado(empleado);
            this.alertaService.alertaConfirmarCreacion();
          }else if(result.dismiss === Swal.DismissReason.cancel ){
            this.alertaService.alertaSinModificaciones();
          }
        }
      )
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  private getAllEmpleados(): void{
    this.empleadoService.getEmpleadosPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.empleados = data.content;
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
      )
  }

  public getEmpleadosUsuarios(nombre?: string): void {
    if(nombre){
      this.isPartialLoading = true;
      forkJoin([
        this.usuarioService.getAllUsers(),
        this.empleadoService.buscarPorNombre(nombre)
      ]).subscribe({
        next: ([usuarios, empleados]) => {
          // @ts-ignore
          const usuariosConEmpleados = usuarios.object.map((usuario: { username: string; }) => {
            const empleadoCorrespondiente = empleados.object.find((empleado: { documento: string; }) => empleado.documento === usuario.username);
            // Solo incluir si se encontró una contraparte de empleado
            if (empleadoCorrespondiente) {
              return { usuario, empleado: empleadoCorrespondiente };
            }
          }).filter((usuarioConEmpleado: any) => usuarioConEmpleado); // Filtrar los valores undefined

          this.usuariosConEmpleados = usuariosConEmpleados;

        },
        error: (error) => {
          if (error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")) {
            this.loginService.logout();
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          } else {
            console.log(error)
          }
        },
        complete: () => {
          this.isPartialLoading = false;
        }
      });
    }else{
      forkJoin([
        this.usuarioService.getAllUsers(),
        this.empleadoService.getEmpleados()
      ]).subscribe({
        next: ([usuarios, empleados]) => {
          // @ts-ignore
          const usuariosConEmpleados = usuarios.object.map((usuario: { username: string; }) => {
            const empleadoCorrespondiente = empleados.object.find((empleado: { documento: string; }) => empleado.documento === usuario.username);
            // Solo incluir si se encontró una contraparte de empleado
            if (empleadoCorrespondiente) {
              return { usuario, empleado: empleadoCorrespondiente };
            }
          }).filter((usuarioConEmpleado: any) => usuarioConEmpleado); // Filtrar los valores undefined

          this.usuariosConEmpleados = usuariosConEmpleados;

        },
        error: (error) => {
          if (error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")) {
            this.loginService.logout();
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          } else {
            console.log(error)
          }
        },
        complete: () => {
          this.isSkeletonLoading = false;
        }
      });
    }

  }


  private actualizarEmpleado(empleado : Empleado){
    this.empleadoService.actualizarEmpleado(empleado)
      .subscribe();
  }

  private buscarEmpleadoPorNombre(nombre : string){

    this.empleadoService.buscarPorNombre(nombre)
      .subscribe(
        empleado =>{

          this.empleados = empleado.object
        }
      );
  }

  private registrarEmpleado(empleadoRegister : UserRegister){
    return this.registerService.registrarEmpleado(empleadoRegister);
  }
  //****************************
  //*******MODALES*******
  //****************************

  public modalEmpleado(){
    const dialogRef = this.dialog.open(ModalEmpleadoComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '500px',
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result){

          //instancia de usuario a registrar
          const userToRegister : UserRegister = {
            id : 0,
            nombre : result.nombre,
            apellido : result.apellido,
            username: result.documento,
            password : result.contrasena,
            rol: result.rol,
            correo : result.correo,
            estado: true
          }
          this.registrarEmpleado(userToRegister)
            .subscribe(
              result  => {
                // en caso de que le creacion haya sido exitosa
                this.alertaService.alertaConfirmarCreacion();
              },error =>{
                if(error.status === 409){
                  //mostrar alerta de error 409 con mensaje custom
                  const mensaje : string = "Ups! ya existe un empleado con este número de documento."
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }else if(error.status === 406){
                  const mensaje : string = "Este correo electrónico ya se encuentra en uso.";
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }
                else{
                  console.log(error)
                }
              }
            )
        }
      }
    )
  }
  public modalGestionarEmpleado(usuarioConEmpleado : any){



    const dialogRef = this.dialog.open(ModalEmpleadoComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '500px',
      data: {
        empleado : usuarioConEmpleado.empleado,
        usuario : usuarioConEmpleado.usuario
      }
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          //si se va a cambiar la contraseña
          if(result.contrasena){
            const userToUpdate : UserRegister = {
              id : 0,
              nombre : result.nombre,
              apellido : result.apellido,
              username: usuarioConEmpleado.empleado.documento,
              password : result.contrasena,
              rol: result.rol,
              correo : result.correo,
              estado: true
            }

            this.usuarioService.actualizarEmpleado(userToUpdate)
              .subscribe(
                result => {
                  this.alertaService.alertaConfirmarCreacion();
                }, error => {
                  if(error.status === 409){
                    //mostrar alerta de error 409 con mensaje custom
                    const mensaje : string = "Ups! No se ha encontrado el empleado."
                    this.alertaService.alertaErrorMensajeCustom(mensaje);
                  }else if(error.status === 406){
                    const mensaje : string = "Este correo electrónico ya se encuentra en uso.";
                    this.alertaService.alertaErrorMensajeCustom(mensaje);
                  }
                  else{
                    console.log(error)
                  }
                }
              );

          }
          else{
            const userToUpdate : UserRegister = {
              id : 0,
              nombre : result.nombre,
              apellido : result.apellido,
              username: usuarioConEmpleado.empleado.documento,
              correo: result.correo,
              rol: result.rol,
              estado: true
            }

            this.usuarioService.actualizarEmpleado(userToUpdate)
              .subscribe(
                result => {
                  this.alertaService.alertaConfirmarCreacion();
                }, error => {
                  if(error.status === 409){
                    //mostrar alerta de error 409 con mensaje custom
                    const mensaje : string = "Ups! No se ha encontrado el empleado."
                    this.alertaService.alertaErrorMensajeCustom(mensaje);
                  }else if(error.status === 406){
                    const mensaje : string = "Este correo electrónico ya se encuentra en uso.";
                    this.alertaService.alertaErrorMensajeCustom(mensaje);
                  }
                  else{
                    console.log(error)
                  }
                }
              );
          }

          //llamar al servicio para actualizar el usuario y empleado

        }
      }
    )

  }


}
