import { Injectable } from '@angular/core';
import {format} from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class FechaHoraService {

  constructor() { }


  //funcion para obtener un string con la fecha actual
  // en formato yyyy-MM-ddTHH:mm:ss
  public obtenerFechaHoraLocalActual() : string {
    const fechaHoraLocal = new Date();
    const pattern = 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX';
    return format(fechaHoraLocal, pattern)
  }

  //funcion para convertir horario local a UTC
  public convertirFechaHoraLocalAUTC(fechaHoraLocal : string) : string {
    const fechaHoraLocalObj = new Date(fechaHoraLocal);

    //un dia cuenta desde las 12.pm hasta las 11:59 del siguiente dia
    //por lo cual si una consulta se hace en la mañana del dia 11, por ejemplo a las 10:00 a.m.
    //cuenta como registro del dia anterior
    //si se hace despues del medio dia cuenta como consulta del dia 11 hasta las 11:59 del dia 12
    const hora = fechaHoraLocalObj.getHours();
    //validar si la consulta se hace en la mañana
    if(hora <12) {
      //se se hace en la mañana se resta un dia para que cuenten las del dia anterior
      // en el rango 12:00 p.m. ===> 11:59 a.m.
      fechaHoraLocalObj.setDate(fechaHoraLocalObj.getDate() - 1);
    }
    //convertir hora local a UTC
    const fechaHoraUTC = fechaHoraLocalObj.toISOString();

    return fechaHoraUTC;
  }

  //funcion para convertir UTC a horario local
  public convertirUTCAFechaHoraLocal(fechaHoraUTC : string | undefined) : string {
    if(fechaHoraUTC){
      if(fechaHoraUTC[fechaHoraUTC.length - 1] !== 'Z'){
        fechaHoraUTC = fechaHoraUTC+'Z';
      }
      const fechaHoraUTCObj = new Date(fechaHoraUTC);
      const fechaHoraLocal = fechaHoraUTCObj.toLocaleString(); // Esto devuelve la fecha y hora en el formato local del navegador.
      return fechaHoraLocal;
    }
    else{
      return "xd"
    }
  }
}
