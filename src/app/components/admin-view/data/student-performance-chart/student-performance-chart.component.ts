import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-student-performance-chart',
  standalone: true,
  imports: [CommonModule, GoogleChartsModule],
  templateUrl: './student-performance-chart.component.html',
  styleUrl: './student-performance-chart.component.scss'
})
export class StudentPerformanceChartComponent implements OnChanges {

  @Input() chartData: any[] = [];

  private resizeObserver: ResizeObserver | null = null;


  chartType: ChartType = ChartType.ColumnChart;
  chartOptions = {
    title: '',
    legend: { position: 'none' },
    hAxis: {
      title: 'Asignatura'
    },
    vAxis: {
      title: 'Calificación',
      minValue: 0,
      maxValue: 10,
      format: '0.0'
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    colors: ['#4285F4'],
    bar: { groupWidth: '70%' },
    width: null,  // Será establecido dinámicamente
    height: 300,
    chartArea: {
      width: '100%',
      height: '70%' // Esto controla el área del gráfico dentro del contenedor
    }
  };

  // Valor para el contenedor, actualizaremos dinámicamente la dimensión del elemento
  height = 300;
  width = undefined; // No usamos un valor fijo aquí

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      // Add header row if not present
      if (this.chartData.length > 0 && typeof this.chartData[0][0] !== 'string') {
        this.chartData = [['Asignatura', 'Puntaje'], ...this.chartData];
      }
    }
  }

  private setupResizeObserver(): void {
    // Limpiar observador anterior si existe
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Crear nuevo observador
    this.resizeObserver = new ResizeObserver(() => {
      this.updateChartSize();
    });

    // Observar el contenedor del gráfico
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      this.resizeObserver.observe(chartContainer);
    }
  }

  private updateChartSize(): void {
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      // Obtener el ancho actual del contenedor
      const containerWidth = chartContainer.clientWidth;

      // Actualizar opciones del gráfico con las nuevas dimensiones
      // No usamos width como string, sino como número
      this.chartOptions = {
        ...this.chartOptions,
        width: containerWidth, // Usar número en lugar de string '100%'
        height: this.height
      };
    }
  }


  ngAfterViewInit(): void {
    // Asegura que el gráfico responda al tamaño de su contenedor
    const resizeObserver = new ResizeObserver(() => {
      // Esto forzará a que el gráfico se redibuje cuando el contenedor cambie de tamaño
      this.chartOptions = { ...this.chartOptions };
    });

    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      resizeObserver.observe(chartContainer);
    }
  }
}
