import {Component, Input, SimpleChanges, ViewChild} from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke, ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;

};
@Component({
  selector: 'app-contrast-chart',
  templateUrl: './contrast-chart.component.html',
  styleUrls: ['./contrast-chart.component.css']
})
export class ContrastChartComponent {
  @ViewChild("chart") chart!: ChartComponent;
  @Input() resumenCaja: any[] = [];
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area",
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "category",
        categories: [],
      },
      tooltip: {
        x: {
          format: "yy/MM/dd"
        }
      }
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resumenCaja'] && this.resumenCaja.length > 0) {
      this.updateChartData();
    }
  }
  private updateChartData() {
    this.chartOptions.series = [
      {
        name: "Total Calculado",
        data: this.resumenCaja.map(item => item.totalCalculado)
      },
      {
        name: "Total Reportado",
        data: this.resumenCaja.map(item => item.totalReportado)
      }
    ];

    this.chartOptions.xaxis.categories = this.resumenCaja.map(item => item.fecha);
  }

}
