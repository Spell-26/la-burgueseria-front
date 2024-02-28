import { Injectable } from '@angular/core';
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {insumo, InsumoProducto, InsumoProductoResponse} from "../../interfaces";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";

interface InsumoDeducir {
  insumo: insumo;
  cantidadARestar: number;
  resultadoResta: number;
}
export interface InsumoReservado{
  insumo: insumo;
  cantidadARestar: number;
  resultadoResta: number;
  producto : string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidarExistenciasService {

  constructor(private insumosPorProductoService : InsumosPorProductoService) { }

  //valida las existencias de los productos y devuelve un objeto con la informacion de los insumos de cada producto
  public async validarExistencias(productosCuenta : ProductoCuenta[]) {
    let insumosReservados : InsumoReservado[] = [];
    //Obtener los insumos de cada producto vinculado a la cuenta
    for (const productoCuenta of productosCuenta) {
      const producto = productoCuenta.producto;
      const cantidadProducto :number = productoCuenta.cantidad; //cantidad de productos soliciado

      try {
        const ippResponse : InsumoProductoResponse = await this.insumosPorProductoService.getIppByProducto(producto.id).toPromise();

        //recorrer el array de ipp obtenido y almacenar los insumos
        for (const ipp of ippResponse.object) {
          //crear una instancia de insumo reservado y añadir al array
          const insumoReservado : InsumoReservado = {
            insumo: ipp.insumo,
            cantidadARestar: cantidadProducto * ipp.cantidad, //cantidad de productos en la carta * cantidad de insumos que necesita cada producto
            resultadoResta : ipp.insumo.cantidad - (cantidadProducto * ipp.cantidad),
            producto : ipp.producto.nombre
          };
          insumosReservados.push(insumoReservado);
        }
      } catch (error) {
        console.error(error);
        // Maneja el error según sea necesario
      }
    }

    return insumosReservados;
  }

  //Evaluar cuantos insumos se deben de reponer
  public async validarInsumosAReponer(productosCuenta : ProductoCuenta[]){
    let insumosReponer : InsumoReservado[] = [];

    //obtener los insumos de cada producto
    for (const productoCuenta of productosCuenta) {
      const producto = productoCuenta.producto;
      const cantidadProducto = productoCuenta.cantidad;
      try{
        const ippResponse : InsumoProductoResponse = await this.insumosPorProductoService.getIppByProducto(producto.id).toPromise();
        for(let ipp of ippResponse.object){
          const insumoReservado : InsumoReservado = {
            insumo: ipp.insumo,
            cantidadARestar: cantidadProducto * ipp.cantidad, //cantidad de productos en la carta * cantidad de insumos que necesita cada producto
            resultadoResta : ipp.insumo.cantidad + (cantidadProducto * ipp.cantidad),
            producto : ipp.producto.nombre
          };

          //añadir a insumos a reponer
          insumosReponer.push(insumoReservado);
        }
      }catch (error) {
        console.error(error);
        // Maneja el error según sea necesario
      }
    }
    return insumosReponer;
  }



  // Método para validar existencias de productos en base a los insumos disponibles
// Método para validar existencias de productos en base a los insumos disponibles
  public async validarExistenciasDeProductos(productosCuenta: ProductoCuenta[]): Promise<{ aDeducir: InsumoDeducir[], insuficientes: InsumoDeducir[] }> {
    // Array para almacenar los insumos a deducir
    let insumosADeducir: InsumoDeducir[] = [];
    // Array para almacenar los insumos insuficientes
    let insumosInsuficientes: InsumoDeducir[] = [];

    // Realizar el procesamiento de cada producto en paralelo
    await Promise.all(productosCuenta.map(async (productoCuenta) => {
      const producto = productoCuenta.producto;
      const cantidad = productoCuenta.cantidad;
      let insumosXProducto: InsumoProducto[] = [];

      try {
        // Obtener los insumos asociados al producto desde el servicio
        const result = await this.insumosPorProductoService.getIppByProducto(producto.id).toPromise();
        insumosXProducto = result.object;
      } catch (error) {
        console.error('Error al obtener los insumos por producto:', error);
      }

      // Verificar si se obtuvieron insumos asociados al producto
      if (insumosXProducto && insumosXProducto.length > 0) {
        // Procesar cada insumo asociado al producto
        for (let ixp of insumosXProducto) {
          const cantidadIpp = ixp.cantidad;
          const cantidadARestar = cantidad * cantidadIpp;
          const insumo = { ...ixp.insumo };
          const resultadoResta = insumo.cantidad - cantidadARestar;

          // Crear objeto que representa el insumo a deducir
          const insumoADeducir: InsumoDeducir = {
            insumo,
            cantidadARestar,
            resultadoResta
          };

          // Agregar el insumo a deducir al array correspondiente
          insumosADeducir.push(insumoADeducir);

          // Verificar si hay insuficiencia de existencias para este insumo
          if (resultadoResta < 0) {
            insumosInsuficientes.push(insumoADeducir);
            // Establecer las existencias en 0 si son negativas
            insumo.cantidad = 0;
          } else {
            insumo.cantidad = resultadoResta;
          }
        }
      }
    }));

    // Devolver los insumos a deducir y los insuficientes
    return { aDeducir: insumosADeducir, insuficientes: insumosInsuficientes };
  }}
