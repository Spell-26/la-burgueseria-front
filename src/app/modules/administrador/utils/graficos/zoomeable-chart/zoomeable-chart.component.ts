import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip
} from 'ng-apexcharts'
import {dataSeries} from "./data-series";

@Component({
  selector: 'app-zoomeable-chart',
  templateUrl: './zoomeable-chart.component.html',
  styleUrls: ['./zoomeable-chart.component.css']
})
export class ZoomeableChartComponent {
  @Input() seriesName: string = 'XYZ MOTORS';
  @Input() resumenData: any[] = []; // Input para recibir los datos

  public series!: ApexAxisChartSeries;
  public chart!: ApexChart;
  public dataLabels!: ApexDataLabels;
  public markers!: ApexMarkers;
  public title!: ApexTitleSubtitle;
  public fill!: ApexFill;
  public yaxis!: ApexYAxis;
  public xaxis!: ApexXAxis;
  public tooltip!: ApexTooltip;


  constructor() {

  }
  //por alguna razon en el constructor no toma los datos
  ngOnChanges(changes: SimpleChanges): void {
    this.initChartData();
  }
  public initChartData(): void {
    let ts2 = 1484418600000;
    let dates = [];

    // Obtener los valores mínimos y máximos del eje Y
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    for (let i = 0; i < this.resumenData.length; i++) {
      ts2 = ts2 + 86400000;
      const valor = this.resumenData[i].valor;
      dates.push([ts2, valor]);

      // Actualizar los valores mínimos y máximos
      minY = Math.min(minY, valor);
      maxY = Math.max(maxY, valor);
    }


    this.series = [
      {
        name: this.seriesName,
        data: dates
      }
    ];
    this.chart = {
      type: "area",
      stacked: false,
      height: 350,
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: "zoom"
      }
    };
    this.dataLabels = {
      enabled: false
    };
    this.markers = {
      size: 0
    };
    this.title = {
    };
    this.fill = {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    };
    this.yaxis = {
      min: minY,  // Establecer el valor mínimo
      max: maxY,  // Establecer el valor máximo
      labels: {
        formatter: function(val) {
          return val.toFixed(0);  // Puedes personalizar el formato según tus necesidades
        }
      },
      title: {
        text: "Precio"
      }
    };
    this.xaxis = {
      type: "datetime"
    };
    this.tooltip = {
      shared: false,
      y: {
        formatter: function(val) {
          return val.toFixed(0);  // Puedes personalizar el formato según tus necesidades
        }
      }
    };
  }

}
