import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-panel-de-gestion',
  templateUrl: './panel-de-gestion.component.html',
  styleUrls: ['./panel-de-gestion.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class PanelDeGestionComponent implements OnInit, OnDestroy{
  isDiaIniciado : boolean = false;
  //hora y fecha para el reloj del header
  tiempoActual : string = '';
  private tiempoSubscription : Subscription | undefined;



  ngOnDestroy(): void {
    // Destruir la subscripcion cuando el componente se destruye
    if (this.tiempoSubscription) {
      this.tiempoSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    // Iniciar la suscripción al observable que emite cada segundo
    this.tiempoSubscription = interval(1000).subscribe(() => {
      this.actualizarTiempo();
    });
  }

  private actualizarTiempo() {
    const fechaActual = new Date();

    // Obtener componentes de fecha
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript comienzan desde 0
    const ano = fechaActual.getFullYear();

    // Obtener componentes de hora
    let horas = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const segundos = fechaActual.getSeconds();

    // Determinar si es a.m. o p.m.
    const amPm = horas >= 12 ? 'p.m.' : 'a.m.';

    // Convertir a formato de 12 horas
    if (horas > 12) {
      horas -= 12;
    }

    // Formatear el tiempo y la fecha con el formato DD-MM-YYYY HH:mm:ss a.m./p.m.
    this.tiempoActual = `${this.agregarCero(dia)}-${this.agregarCero(mes)}-${ano} ${this.agregarCero(horas)}:${this.agregarCero(minutos)}:${this.agregarCero(segundos)} ${amPm}`;
  }

  private agregarCero(valor: number): string {
    return valor < 10 ? `0${valor}` : `${valor}`;
  }

  public iniciarOTerminarDia(){
    this.isDiaIniciado = !this.isDiaIniciado;
    //debe lanzar alerta de confirmación para iniciar el dia
    //en caso de inicar el día debe mostrar un modal para asignar el valor de inicio en la caja menor
    //el valor de la caja menor se guarda en local storage junto con el estado de la variable isDiaIniciado
    //cuando se cierra y el dia debe pedir confirmacion
    //si es acertiva se abre modal para que se ingrese el total recaudado y se guarda en la base de datos
  }
}
