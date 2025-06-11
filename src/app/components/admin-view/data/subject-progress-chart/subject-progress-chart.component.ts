import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';

export interface DateRange {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-subject-progress-chart',
  standalone: true,
  imports: [CommonModule, GoogleChartsModule, FormsModule],
  templateUrl: './subject-progress-chart.component.html',
  styleUrl: './subject-progress-chart.component.scss'
})
export class SubjectProgressChartComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() chartData: any[] = [];
  @Input() subjects: string[] = ['Matematica', 'Escritura', 'Lectura', 'Disciplina'];
  @Output() dateRangeChange = new EventEmitter<DateRange>();
  
  processedData: any[] = [];
  chartColumns: any[] = [];
  
  // Filtros de fecha
  startDate: string = '';
  endDate: string = '';
  
  chartType : ChartType = ChartType.AreaChart;
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
      height: '65%',
      backgroundColor: 'transparent',
      left: '10%',
      right: '5%'
    },
    backgroundColor: 'transparent',
    width: null,
    height: 300,
    explorer: {
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 4.0
    },
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
    this.setDefaultDateRange();
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
    this.setupResizeObserver();
    setTimeout(() => this.updateChartSize(), 300);
  }
  
  public setDefaultDateRange(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    
    if (currentMonth <= 6) {
      // Primer semestre: enero a junio
      this.startDate = `${currentYear}-01-01`;
      this.endDate = `${currentYear}-06-30`;
    } else {
      // Segundo semestre: julio a diciembre
      this.startDate = `${currentYear}-07-01`;
      this.endDate = `${currentYear}-12-31`;
    }
  }
  
  onDateRangeChange(): void {
    this.processChartData();
    this.dateRangeChange.emit({ 
      startDate: this.startDate, 
      endDate: this.endDate 
    });
  }
  
  private setupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.resizeObserver = new ResizeObserver(() => {
      this.updateChartSize();
    });
    
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      this.resizeObserver.observe(chartContainer);
    }
  }
  
  private updateChartSize(): void {
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      const containerWidth = chartContainer.clientWidth;
      this.chartOptions = {
        ...this.chartOptions,
        width: containerWidth,
        height: this.height
      };
    }
  }
  
  processChartData(): void {
    if (!this.chartData || this.chartData.length === 0) {
      this.processedData = [];
      this.chartColumns = [];
      return;
    }
    
    // Filtrar datos por rango de fechas
    const filteredData = this.filterDataByDateRange();
    
    if (filteredData.length === 0) {
      this.processedData = [];
      this.chartColumns = [];
      return;
    }
    
    // Determinar qué asignaturas están presentes en los datos actuales
    // El primer elemento es la fecha, el resto son las asignaturas
    const availableSubjectsCount = filteredData.length > 0 ? filteredData[0].length - 1 : 0;
    
    // Crear encabezados dinámicamente basados en los datos disponibles
    this.chartColumns = [];
    this.chartColumns.push({type: 'string', label: 'Fecha'});
    
    // Solo agregar las columnas para las asignaturas que realmente tenemos datos
    for (let i = 0; i < availableSubjectsCount; i++) {
      const subjectName = i < this.subjects.length ? this.subjects[i] : `Asignatura ${i + 1}`;
      this.chartColumns.push({type: 'number', label: subjectName});
    }
    
    // Procesar los datos filtrados manteniendo la estructura original
    this.processedData = filteredData.map(row => {
      const newRow = [row[0]]; // La fecha (como string)
      
      // Añadir exactamente los valores que vienen en los datos
      for (let i = 1; i < row.length; i++) {
        const value = row[i] !== null && row[i] !== undefined ? parseFloat(row[i].toString()) : 0;
        newRow.push(value);
      }
      
      return newRow;
    });
  }
  
  private filterDataByDateRange(): any[] {
    if (!this.startDate || !this.endDate) {
      return this.chartData;
    }
    
    const startDateObj = new Date(this.startDate);
    const endDateObj = new Date(this.endDate);
    
    return this.chartData.filter(row => {
      if (!row[0]) return false;
      
      // Convertir la fecha del formato mm/dd/yyyy a objeto Date
      const rowDate = new Date(row[0]);
      
      return rowDate >= startDateObj && rowDate <= endDateObj;
    });
  }
  
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}