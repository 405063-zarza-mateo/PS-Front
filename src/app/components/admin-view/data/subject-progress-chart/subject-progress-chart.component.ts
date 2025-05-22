import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

@Component({
  selector: 'app-subject-progress-chart',
  standalone: true,
  imports: [CommonModule, GoogleChartsModule],
  templateUrl: './subject-progress-chart.component.html',
  styleUrl: './subject-progress-chart.component.scss'
})
export class SubjectProgressChartComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() chartData: any[] = [];
  
  processedData: any[] = [];
  chartColumns: any[] = [];
  
  chartType : ChartType = ChartType.AreaChart;
  // Corregir error de duplicación de chartArea
  chartOptions: any = {
    title: 'Progreso de Rendimiento a Lo Largo del Tiempo',
    hAxis: {
      title: 'Fecha',
      textPosition: 'out'
    },
    vAxis: {
      title: 'Calificación',
      minValue: 0,
      maxValue: 5
    },
    curveType: 'function',
    legend: { position: 'bottom' },
    chartArea: {
      width: '85%',
      height: '75%',
      backgroundColor: 'transparent',
      left: '10%',
      right: '5%'
    },
    backgroundColor: 'transparent',
    width: null,  // Será establecido dinámicamente
    height: 300,
    explorer: {
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 4.0
    },
    // Desactivar las animaciones para evitar problemas de tamaño
    animation: {
      startup: true,
      duration: 500,
      easing: 'out'
    }
  };
  
  height = 300;
  private resizeObserver: ResizeObserver | null = null;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    // Asegura que haya datos procesados incluso antes de ngOnChanges
    if (this.chartData && this.chartData.length > 0) {
      this.processChartData();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData && this.chartData.length > 0) {
      this.processChartData();
    }
  }
  
  ngAfterViewInit(): void {
    // Configurar el observador de redimensionamiento para actualizar el gráfico
    this.setupResizeObserver();
    
    // Forzar un redimensionamiento inicial después de un breve retraso
    // para dar tiempo al DOM a renderizarse completamente
    setTimeout(() => this.updateChartSize(), 300);
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
  
  processChartData(): void {
    if (!this.chartData || this.chartData.length === 0) {
      this.processedData = [];
      return;
    }
    
    // Crear encabezados para las columnas
    this.chartColumns = [];
    this.chartColumns.push({type: 'string', label: 'Fecha'});
    
    // Determinar qué asignaturas están presentes en los datos
    const subjects: string[] = [];
    if (this.chartData.length > 0 && this.chartData[0].length > 1) {
      for (let i = 1; i < this.chartData[0].length; i++) {
        const subject = `Asignatura ${i}`;
        subjects.push(subject);
        this.chartColumns.push({type: 'number', label: subject});
      }
    }
    
    // Procesar los datos para asegurarnos de que todas las filas sean correctas
    this.processedData = this.chartData.map(row => {
      const newRow = [row[0]]; // La fecha (como string)
      
      // Añadir los valores numéricos para cada asignatura
      for (let i = 1; i < row.length; i++) {
        // Asegurarnos de que los valores son numéricos
        const value = row[i] !== null && row[i] !== undefined ? parseFloat(row[i].toString()) : 0;
        newRow.push(value);
      }
      
      return newRow;
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar el observador al destruir el componente
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}