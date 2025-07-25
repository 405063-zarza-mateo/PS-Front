import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-course-comparison-chart',
  standalone: true,
  imports: [CommonModule, GoogleChartsModule],
  templateUrl: './course-comparison-chart.component.html',
  styleUrl: './course-comparison-chart.component.scss'
})
export class CourseComparisonChartComponent implements OnChanges {
   @Input() chartData: any[] = [];
  
  chartType : ChartType = ChartType.ColumnChart;
  chartOptions: any = {
    title: 'Rendimiento por Curso',
    hAxis: {
      title: 'Curso'
    },
    vAxis: {
      title: 'Promedio',
      minValue: 0,
      maxValue: 5
    },
    legend: { position: 'none' },
    colors: ['#4285F4'],
    chartArea: {
      width: '100%', // Controla el área del gráfico dentro del contenedor
      height: '70%'
    }
  };
  
  height = 300;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData && this.chartData.length > 0) {
      // Asegurar que los datos estén en el formato correcto para Google Charts
      this.chartData = this.chartData.map(row => [row[0], parseFloat(row[1].toString())]);
    }
  }
  
  ngAfterViewInit(): void {
    // Asegura que el gráfico responda al tamaño de su contenedor
    const resizeObserver = new ResizeObserver(() => {
      // Esto forzará a que el gráfico se redibuje cuando el contenedor cambie de tamaño
      this.chartOptions = {...this.chartOptions};
    });
    
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      resizeObserver.observe(chartContainer);
    }
  }
}
