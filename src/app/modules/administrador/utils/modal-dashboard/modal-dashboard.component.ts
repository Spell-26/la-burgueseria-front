import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AlertasService } from "../sharedMethods/alertas/alertas.service";
import { CuentasService } from "../../services/cuentas.service";
import { FechaHoraService } from "../sharedMethods/fechasYHora/fecha-hora.service";
import { EgresoService } from "../../services/egreso.service";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-modal-dashboard',
  templateUrl: './modal-dashboard.component.html',
  styleUrls: ['./modal-dashboard.component.css']
})
export class ModalDashboardComponent implements OnInit {

  public tituloModal = "Iniciar día.";
  form: FormGroup;
  deshabilitarBotones = false;
  isIniciarDia: boolean = true;
  totalCalculado: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ModalDashboardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private alertaService: AlertasService,
    private cuentaService: CuentasService,
    private fechaHoraService: FechaHoraService,
    private egresoService: EgresoService
  ) {
    this.form = this.fb.group({
      totalCalculado: [null],
      totalReportado: [null],
      saldoInicioCajaMenor: [null, [
        Validators.required,
        Validators.min(5000),
        Validators.max(3000000), // Máximo 3 millones
        Validators.pattern(/^[1-9]\d{0,6}$/) // Patrón para aceptar números enteros positivos hasta 7 dígitos
      ]],
      observaciones: [null],
      fechaHoraInicio: [null],
      fechaHoraCierre: [null],
      estadoCaja: [null],
      inicio : [null],
      cierre : [null]
    });

    if (data) {
      let horaLocal:string  = this.fechaHoraService.convertirUTCAFechaHoraLocal(data.fechaHoraInicio);
      this.totalCalculado = data.saldoInicioCajaMenor;
      let horaCierre : any = this.fechaHoraService.obtenerFechaHoraLocalActual();
      let horaCierreUTC = this.fechaHoraService.convertirFechaHoraLocalAUTC(horaCierre);
      horaCierre = new Date(horaCierre).toLocaleString()

      this.form = this.fb.group({
        id: [data.id],
        totalCalculado : [this.totalCalculado, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        totalReportado : [data.totalReportado, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        saldoInicioCajaMenor : [data.saldoInicioCajaMenor, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        observaciones : [data.observaciones, Validators.required],
        fechaHoraInicio : [data.fechaHoraInicio],
        fechaHoraCierre : [horaCierreUTC],
        estadoCaja: [data.estadoCaja],
        inicio : [horaLocal],
        cierre : [horaCierre]
      });

      // Utilizar forkJoin para esperar a que ambas peticiones se completen
      forkJoin([
        this.cuentaService.cuentasByFecha(data.fechaHoraInicio, null),
        this.egresoService.getListEgresoByFecha(data.fechaHoraInicio, null)
      ]).subscribe(
        ([cuentasResult, egresosResult]) => {
          if (cuentasResult.object.length > 0) {
            for (let r of cuentasResult.object) {
              if (r.estadoCuenta.nombre == "Pagada") {
                this.totalCalculado += r.total;
              }
            }
          }

          if (egresosResult.object.length > 0) {
            for (let r of egresosResult.object) {
              if (r.deduccionDesde == "Caja menor") {
                this.totalCalculado -= r.total;
              }
            }
          }

          // Después de completar las operaciones asíncronas, actualizar el formulario
          this.isIniciarDia = false;
          this.tituloModal = "Cerrar caja";
          this.form.patchValue({
            id: data.id,
            totalCalculado: this.totalCalculado,
            saldoInicioCajaMenor: data.saldoInicioCajaMenor,
            observaciones: data.observaciones, // Asegúrate de proporcionar un valor adecuado aquí
            fechaHoraInicio: data.fechaHoraInicio,
            fechaHoraCierre: horaCierreUTC,
            estadoCaja: false
          });
        }
      );

      //deshabilitar campos del formulario
      this.form.get('totalCalculado')?.disable();
      this.form.get('saldoInicioCajaMenor')?.disable();
      this.form.get('fechaHoraInicio')?.disable();
      this.form.get('inicio')?.disable();
      this.form.get('cierre')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.alertaService.alertaPedirConfirmacionCrear()
        .then((result) => {
          if (result.isConfirmed) {
            //habilitar devuelta los campos inhabilitados para que se incluyan en el response
            this.form.get('totalCalculado')?.enable();
            this.form.get('saldoInicioCajaMenor')?.enable();
            this.form.get('fechaHoraInicio')?.enable();
            this.form.get('inicio')?.enable();
            this.form.get('cierre')?.enable();

            this.dialogRef.close(this.form.value);
          }
        });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
