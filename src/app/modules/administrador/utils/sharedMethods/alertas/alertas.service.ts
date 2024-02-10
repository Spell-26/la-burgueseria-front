import { Injectable } from '@angular/core';
import Swal, {SweetAlertResult} from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  constructor() { }


  //alerta confirmar eliminar

  //esta elerta retorna dos valores
  //.isConfirmed y .isDimissed
  //un ejemplo de uso donde se haga el import de estta funcion seria el siguiente:
  /*
  * this.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){
          * AGGREGAR ACCIONES PERSONALIZADAS (PUEDE SER OTRA ALERTA)
            console.log('Eliminando elemento....')
          }else if(result.dismiss === Swal.DismissReason.cancel ){
          * AGREGAR ACCIONES PERSONALIZADAS (PUEDE SER OTRA ALERTA)
            console.log("Se ha cancelado la eliminacion")
          }
        }
      );
  * */
  public alertaConfirmarEliminar() : Promise<SweetAlertResult>{
    // @ts-ignore
    return Swal.fire({
      title: "¿Estas seguro de eliminar este elemento?",
      icon:"warning",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
      cancelButtonText:"Cancelar",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    }).then(
      // @ts-ignore
      (result) => {
        if(result.isConfirmed){
          return Swal.fire({
            title: "¡Esta acción es irreversible!",
            text: "Todas las entidades asociadas a esta también serán eliminadas",
            icon:"warning",
            color: "#d33",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, estoy seguro de eliminar.",
            cancelButtonText:"Cancelar",
            reverseButtons: true,
            background: '#1e1e1e', // Fondo oscuro
          })

        }else if(result.dismiss === Swal.DismissReason.cancel ){
          let timerInterval: any;
          // @ts-ignore
          return Swal.fire({
            title: "No se ha realizado ningún cambio en el elemento.",
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
                // @ts-ignore
                const remainingSeconds = Swal.getTimerLeft() / 1000;

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

  //alerta pera pedir confirmacion al editar
  public alertaPedirConfirmacionEditar() : Promise<SweetAlertResult>{
    // @ts-ignore
    return Swal.fire({
      title: "¿Estas seguro de editar este elemento?",
      icon:"warning",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, editar.",
      cancelButtonText:"Cancelar",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    })
  }

  //alerta para informar que los insumos es menor a 0
  public alertaInsumosNegativos(insumosADeducir : any[]) : Promise<SweetAlertResult>{
    const listaHtml = insumosADeducir.map(
      (insumo) => {
        return `<li><b>${insumo.insumo.nombre}</b>: Existencias: ${insumo.insumo.cantidad},
                Cantidad a restar: ${insumo.cantidadARestar},
                Cantidad Resultante: ${insumo.resultadoResta}</li>`
      }
    ).join('');

    // @ts-ignore
    return Swal.fire({
      title: "¡Atención! no hay ingredientes suficientes para este pedido.",
      html: `<ul>${listaHtml}</ul>`,
      icon: "warning",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    });
  }


  public alertaConfirmarCreacion(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "Elemento guardado exitosamente!",
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;

        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      // Lógica adicional después de cerrar la alerta
    });
  }

  //confirmar cierre del dia
  public alertaConfirmarCierreDia(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "¡El cierre de caja ha sido exitoso!",
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;

        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      // Lógica adicional después de cerrar la alerta
    });
  }
  public alertaDiaIniciadoCorrectamente(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "¡Se ha iniciado el dia laboral correctamente!",
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;

        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      // Lógica adicional después de cerrar la alerta
    });
  }

  //alerta pedir confirmacion para crear
  public alertaPedirConfirmacionCrear(): Promise<SweetAlertResult>{
    // @ts-ignore
    return Swal.fire({
      title : "¿Deseas guardar?",
      html: "<p>Aún puedes hacer cambios si lo deseas.</p>",
      icon: "question",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, guardar.",
      cancelButtonText:"Aún tengo cambios por hacer.",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    })
  }

  //Alerta de confirmación con mensaje custom
  public alertaPedirConfirmacionMensajeCustom(titulo : string, subTitulo : string, colorTexto : string) : Promise<SweetAlertResult>{
    return Swal.fire({
      title : `${titulo}`,
      icon: "question",
      html: `<p>${subTitulo}</p>`,
      color: `${colorTexto}`,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar.",
      cancelButtonText:"Cancelar.",
      reverseButtons: true,
      background: '#1e1e1e', // Fondo oscuro
    })
  }
  //alerta temporal confirmar eliminacion
  public alertaEliminadoCorrectamente(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "Se ha eliminado el elemento correctamente.",
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    });
  }

  //Alerta con mensajes customs para errores
  public alertaErrorMensajeCustom(mensaje : string){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "¡Error!",
      html: `<p>${mensaje}</p>`,
      icon: 'error',
      timer: 5000,
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;

        }, 500);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    });
  }
  //alerta con builder customs para errores
  public alertaErrorBuilderCustom(mensaje : string, titulo : string, btn1 : string, color :string){
    return Swal.fire({
      title : `${titulo}`,
      icon: "warning",
      html: `<p>${mensaje}</p>`,
      color: `${color}`,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      confirmButtonText: `${btn1}`,
      background: '#1e1e1e', // Fondo oscuro
    })
  }

  //alerta cuando no se realizó ninguna modificacion en el elemento
  public alertaSinModificaciones(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "No se ha realizado ningún cambio en el elemento.",
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
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 1000;

        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    });
  }
}
