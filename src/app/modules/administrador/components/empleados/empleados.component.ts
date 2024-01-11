import {Component, OnInit} from '@angular/core';
import {Empleado} from "../../interfaces/empleado";
import {EmpleadosService} from "../../services/empleados.service";
import {MatDialog} from "@angular/material/dialog";
import {Validators} from "@angular/forms";
import {ModalLateralComponent} from "../../utils/modal-lateral/modal-lateral.component";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css',  '../../utils/styles/estilosCompartidos.css']
})
export class EmpleadosComponent implements OnInit{
  public empleados : Empleado[] = [];
  public nombreBusqueda : string | null = null;
  public isNombreBusqueda : boolean = false;

  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;

  //datos para la edicion
  documentoEmpleado : number  = 0;
  nombreEmpleado : string = "";
  apellidoEmpleado : string = "";


  //CONSTRUCTOR
  constructor(private empleadoService : EmpleadosService, public dialog : MatDialog,
              private alertaService : AlertasService) {
  }

  ngOnInit(): void {
    this.empleadoService.refreshNeeded
      .subscribe(
        () => {
          this.getAllEmpleados();
        }
      );
    this.getAllEmpleados();
  }


  //****************************
  //*******MÉTODOS*******
  //****************************

  //proxima pagina
  public  nextPage(){
    this.pagina+=1;
    this.getAllEmpleados();
  }

  //pagina anterior
  public  previousPage(){
    this.pagina-=1;
    this.getAllEmpleados();
  }

  public cambiarEstadoEmpleado(index : number){
    this.documentoEmpleado = this.empleados[index].documento;
    this.nombreEmpleado =this.empleados[index].nombre;
    this.apellidoEmpleado = this.empleados[index].apellido;

    //instancia del empleado
    const empleado : Empleado = {
      id: this.empleados[index].id,
      documento: this.documentoEmpleado,
      nombre: this.nombreEmpleado,
      apellido: this.apellidoEmpleado,
      //se asigna lo contrario al estado existente
      estado: !this.empleados[index].estado
    };

    //alerta confirmar edicion
    this.alertaService.alertaPedirConfirmacionEditar()
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




    //reset de variables.
    this.documentoEmpleado = 0;
    this.nombreEmpleado = "";
    this.apellidoEmpleado = "";
  }

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
          console.log(error.error())
        }
      )
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

  private crearEmpleado(empleado : Empleado){
    return this.empleadoService.crearEmpleado(empleado);
  }
  //****************************
  //*******MODALES*******
  //****************************
  public crearEmpleadoModal() : void{
    const camposEmpleado = [
      {nombre : 'documento', label: 'Número de documento', tipo: 'number', validadores: [Validators.required, Validators.pattern(/^[0-9]+$/)]},
      {nombre: 'nombre', label: 'Nombre del empleado', tipo: 'text', validadores: [Validators.required]},
      {nombre: 'apellido', label: 'Apellido del empleado', tipo: 'text', validadores: [Validators.required]},
    ];
    const dialogRef = this.dialog.open(ModalLateralComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: {campos: camposEmpleado, titulo: 'Nuevo Empleado'}
    });

    dialogRef.afterClosed().subscribe(
      result => {
        const empleado : Empleado = {
          id: 0,
          documento: result.documento,
          nombre: result.nombre,
          apellido: result.apellido,
          estado: true
        };

        this.alertaService.alertaConfirmarCreacion();

        this.crearEmpleado(empleado)
          .subscribe(
          );
      }
    )
  }

}
