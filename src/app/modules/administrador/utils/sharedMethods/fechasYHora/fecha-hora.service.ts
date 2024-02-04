import { Injectable } from '@angular/core';
import {format, parse, addHours} from "date-fns";

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
  // Convertir formato personalizado a yyyy-MM-dd'T'HH:mm:ss.SSSXXX
  public convertirLocalFormatAFormatoEstandar(fechaHoraString: string): string {
    // Parsear la fecha y hora del formato personalizado
    const fechaHoraParsed = parse(fechaHoraString, 'dd/M/yyyy, h:mm:ss a', new Date());

    // Formatear la fecha y hora al formato deseado
    const pattern = 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX';
    return format(fechaHoraParsed, pattern);
  }
}
