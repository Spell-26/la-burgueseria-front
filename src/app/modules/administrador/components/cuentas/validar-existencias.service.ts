import { Injectable } from '@angular/core';
import {ProductoCuenta} from "../../interfaces/productosCuenta";
import {insumo, InsumoProducto} from "../../interfaces";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";

interface InsumoDeducir {
  insumo: insumo;
  cantidadARestar: number;
  resultadoResta: number;
}

@Injectable({
  providedIn: 'root'
})
export class ValidarExistenciasService {

  constructor(private insumosPorProductoService : InsumosPorProductoService) { }

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
