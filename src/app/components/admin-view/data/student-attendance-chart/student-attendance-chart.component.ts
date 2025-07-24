import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { AssistanceDto } from '../../../../models/assistanceDto';

@Component({
  selector: 'app-student-attendance-chart',
  standalone: true,
  imports: [CommonModule, GoogleChartsModule, FormsModule],
  templateUrl: './student-attendance-chart.component.html',
  styleUrl: './student-attendance-chart.component.scss'
})
export class StudentAttendanceChartComponent implements OnInit, OnChanges {
  @Input() assistanceData: AssistanceDto[] = [];
  @Input() selectedCourse: string = '';

  // Configuración del gráfico
  chartType = ChartType.AreaChart;
  chartColumns: string[] = [];
  chartData: any[] = [];
  chartOptions: any = {};
  chartHeight = 400;

  // Filtros de fecha
  startDate: string = '';
  endDate: string = '';

  // Estadísticas
  totalDays: number = 0;
  averageAttendance: number = 0;
  maxAttendance: number = 0;
  activeCourses: number = 0;

  // Orden de cursos corregido para incluir todos los cursos del enum Course
  private courseOrder: string[] = [
    'Jardin',
    'Primer_grado',
    'Segundo_grado',
    'Tercer_grado',
    'Cuarto_grado',
    'Quinto_grado',
    'Sexto_grado',
    'Primer_anio',
    'Segundo_anio',
    'Tercer_anio',
    'Cuarto_anio',
    'Quinto_anio',
    'Sexto_anio',
    'Universidad',
    'TOTAL'
  ];

  ngOnInit(): void {
    console.log('StudentAttendanceChartComponent inicializado');
    console.log('Datos iniciales de asistencia:', this.assistanceData);
    this.setCurrentSemester();
    this.setupChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Cambios detectados en StudentAttendanceChartComponent:', changes);
    if (changes['assistanceData']) {
      console.log('Cambio en assistanceData:', changes['assistanceData'].currentValue);
      this.prepareChartData();
    }
  }

  setCurrentSemester(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12

    // Determinar si estamos en primer semestre (enero-junio) o segundo semestre (julio-diciembre)
    if (currentMonth >= 1 && currentMonth <= 6) {
      // Primer semestre: enero a junio
      this.startDate = `${currentYear}-01-01`;
      this.endDate = `${currentYear}-06-30`;
      console.log('Estableciendo primer semestre:', this.startDate, 'a', this.endDate);
    } else {
      // Segundo semestre: julio a diciembre
      this.startDate = `${currentYear}-07-01`;
      this.endDate = `${currentYear}-12-31`;
      console.log('Estableciendo segundo semestre:', this.startDate, 'a', this.endDate);
    }

    this.onDateRangeChange();
  }

  setCurrentYear(): void {
    const currentYear = new Date().getFullYear();
    this.startDate = `${currentYear}-01-01`;
    this.endDate = `${currentYear}-12-31`;
    console.log('Estableciendo año completo:', this.startDate, 'a', this.endDate);
    this.onDateRangeChange();
  }

  // Método adicional para establecer el primer semestre manualmente
  setFirstSemester(): void {
    const currentYear = new Date().getFullYear();
    this.startDate = `${currentYear}-01-01`;
    this.endDate = `${currentYear}-06-30`;
    console.log('Estableciendo primer semestre manualmente:', this.startDate, 'a', this.endDate);
    this.onDateRangeChange();
  }

  // Método adicional para establecer el segundo semestre manualmente
  setSecondSemester(): void {
    const currentYear = new Date().getFullYear();
    this.startDate = `${currentYear}-07-01`;
    this.endDate = `${currentYear}-12-31`;
    console.log('Estableciendo segundo semestre manualmente:', this.startDate, 'a', this.endDate);
    this.onDateRangeChange();
  }

  onDateRangeChange(): void {
    this.prepareChartData();
  }

  private setupChartOptions(): void {
    this.chartOptions = {
      title: 'Asistencia de Alumnos por Curso',
      hAxis: {
        title: 'Fecha',
        textPosition: 'out',
        format: 'dd/MM/yyyy'
      },
      vAxis: {
        title: 'Cantidad de Alumnos',
        titleTextStyle: {
          fontSize: 12,
          italic: false
        },
        minValue: 0,
        textStyle: {
          fontSize: 10
        }
      },
      areaOpacity: 0.7,
      lineWidth: 2,
      pointSize: 5,
      interpolateNulls: false,
      isStacked: 'true',
      legend: {
        position: 'bottom',
        alignment: 'start'
      },
      chartArea: {
        width: '85%',
        height: '65%',
        backgroundColor: 'transparent',
        left: '10%',
        right: '5%'
      },
      backgroundColor: 'transparent',
      explorer: {
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 4.0
      },
      animation: {
        startup: true,
        duration: 500,
        easing: 'out'
      },
      colors: this.getOrderedColors(),
      focusTarget: 'category'
                 
    };
  }

  private getOrderedColors(): string[] {
    return [
      '#FF6B6B', // Jardín - Rosa
      '#4285F4', // Primer Grado - Azul
      '#34A853', // Segundo Grado - Verde
      '#FBBC05', // Tercer Grado - Amarillo
      '#EA4335', // Cuarto Grado - Rojo
      '#9C27B0', // Quinto Grado - Púrpura
      '#00BCD4', // Sexto Grado - Cian
      '#795548', // Primer Año - Marrón
      '#607D8B', // Segundo Año - Azul Gris
      '#FF5722', // Tercer Año - Naranja Profundo
      '#8BC34A', // Cuarto Año - Verde Claro
      '#E91E63', // Quinto Año - Rosa Profundo
      '#009688', // Sexto Año - Verde Azulado
      '#673AB7', // Universidad - Púrpura Profundo
      '#FF9800'  // Total - Naranja
    ];
  }

  private prepareChartData(): void {
    console.log('Preparando datos del gráfico...');
    console.log('Datos de asistencia recibidos:', this.assistanceData);

    if (!this.assistanceData || this.assistanceData.length === 0) {
      console.log('No hay datos de asistencia');
      this.chartData = [];
      this.resetStatistics();
      return;
    }

    // Filtrar datos por rango de fechas
    const filteredData = this.filterDataByDateRange();

    if (filteredData.length === 0) {
      console.log('No hay datos después del filtro de fechas');
      this.chartData = [];
      this.resetStatistics();
      return;
    }

    // Obtener cursos únicos y ordenarlos
    const allCourses = [...new Set(filteredData.map(item => item.course))];
    const orderedCourses = this.orderCourses(allCourses);
    console.log('Cursos ordenados:', orderedCourses);

    // Filtrar por curso seleccionado si existe
    const coursesToShow = this.selectedCourse
      ? orderedCourses.filter(course => course === this.selectedCourse)
      : orderedCourses;

    console.log('Cursos a mostrar:', coursesToShow);

    // Configurar columnas con nombres formateados
    this.chartColumns = ['Fecha', ...coursesToShow.map(course => this.formatCourseName(course))];

    // Agrupar datos por fecha
    const dataByDate = this.groupDataByDate(filteredData, coursesToShow);
    console.log('Datos agrupados por fecha:', dataByDate);

    // Convertir a formato de Google Charts
    this.chartData = this.convertToChartFormat(dataByDate, coursesToShow);
    console.log('Datos finales del gráfico:', this.chartData);

    // Calcular estadísticas
    this.calculateStatistics(dataByDate, coursesToShow);
  }

  private orderCourses(courses: string[]): string[] {
    // Ordenar cursos según el orden predefinido
    const ordered = this.courseOrder.filter(course => courses.includes(course));

    // Agregar cualquier curso no previsto al final
    const remaining = courses.filter(course => !this.courseOrder.includes(course));

    return [...ordered, ...remaining];
  }

  private filterDataByDateRange(): AssistanceDto[] {
    if (!this.startDate || !this.endDate) {
      console.log('Fechas no establecidas');
      return this.assistanceData;
    }

    const startDateObj = this.createBuenosAiresDate(this.startDate);
    const endDateObj = this.createBuenosAiresDate(this.endDate);

    console.log('Filtrando desde:', startDateObj, 'hasta:', endDateObj);
    console.log('Datos originales:', this.assistanceData.length);

    const filtered = this.assistanceData.filter(item => {
      const itemDate = this.createBuenosAiresDate(item.date);
      const isInRange = itemDate >= startDateObj && itemDate <= endDateObj;

      return isInRange;
    });

    console.log('Datos filtrados:', filtered.length);
    return filtered;
  }

  private createBuenosAiresDate(dateInput: any): Date {
    let date: Date;

    if (typeof dateInput === 'string') {
      // Si es string en formato YYYY-MM-DD, crear fecha en Buenos Aires
      if (dateInput.includes('-') && dateInput.length === 10) {
        const [year, month, day] = dateInput.split('-').map(Number);
        date = new Date(year, month - 1, day, 12, 0, 0); // Mediodía para evitar problemas de zona horaria
      } else {
        date = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      date = new Date(dateInput);
    } else {
      date = new Date(dateInput);
    }

    return date;
  }

  private groupDataByDate(data: AssistanceDto[], courses: string[]): { [date: string]: { [course: string]: number } } {
    const grouped: { [date: string]: { [course: string]: number } } = {};

    data.forEach(item => {
      const itemDate = this.createBuenosAiresDate(item.date);
      const dateKey = this.formatDateKey(itemDate);

      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
        courses.forEach(course => {
          grouped[dateKey][course] = 0;
        });
      }

      if (courses.includes(item.course)) {
        grouped[dateKey][item.course] = item.assistance;
      }
    });

    return grouped;
  }

  private convertToChartFormat(dataByDate: { [date: string]: { [course: string]: number } }, courses: string[]): any[] {
    const chartData: any[] = [];

    // Ordenar fechas cronológicamente
    const sortedDates = Object.keys(dataByDate).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    sortedDates.forEach(date => {
      const displayDate = this.formatChartDate(new Date(date));
      const row: any[] = [new Date(date)]; // Usar objeto Date para que Google Charts formatee correctamente

      courses.forEach(course => {
        const attendance = dataByDate[date][course] || 0;
        row.push(attendance);
      });

      chartData.push(row);
    });

    return chartData;
  }

  private formatChartDate(date: Date): string {
    // Formato DD/MM/YYYY para mostrar en el gráfico
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private calculateStatistics(dataByDate: { [date: string]: { [course: string]: number } }, courses: string[]): void {
    const dates = Object.keys(dataByDate);
    this.totalDays = dates.length;
    this.activeCourses = courses.filter(course => course !== 'TOTAL').length;

    if (dates.length === 0) {
      this.averageAttendance = 0;
      this.maxAttendance = 0;
      return;
    }

    let totalAttendance = 0;
    let maxDaily = 0;

    dates.forEach(date => {
      // Usar el valor TOTAL si existe, sino sumar todos los cursos
      let dailyTotal = 0;

      if (dataByDate[date]['TOTAL']) {
        dailyTotal = dataByDate[date]['TOTAL'];
      } else {
        courses.filter(course => course !== 'TOTAL').forEach(course => {
          dailyTotal += dataByDate[date][course] || 0;
        });
      }

      totalAttendance += dailyTotal;
      maxDaily = Math.max(maxDaily, dailyTotal);
    });

    this.averageAttendance = Math.round(totalAttendance / dates.length);
    this.maxAttendance = maxDaily;
  }

  private resetStatistics(): void {
    this.totalDays = 0;
    this.averageAttendance = 0;
    this.maxAttendance = 0;
    this.activeCourses = 0;
  }

  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatDisplayDate(date: Date): string {
    // Formato DD/MM/YYYY para estadísticas y logs
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private formatCourseName(course: string): string {
    if (!course) return '';

    if (course === 'TOTAL') return 'Total';
    if (course === 'Jardin') return 'Jardín';
    if (course === 'Universidad') return 'Universidad';

    // Manejar casos específicos de cursos
    const courseMap: { [key: string]: string } = {
      'Primer_grado': 'Primer Grado',
      'Segundo_grado': 'Segundo Grado',
      'Tercer_grado': 'Tercer Grado',
      'Cuarto_grado': 'Cuarto Grado',
      'Quinto_grado': 'Quinto Grado',
      'Sexto_grado': 'Sexto Grado',
      'Primer_anio': 'Primer Año',
      'Segundo_anio': 'Segundo Año',
      'Tercer_anio': 'Tercer Año',
      'Cuarto_anio': 'Cuarto Año',
      'Quinto_anio': 'Quinto Año',
      'Sexto_anio': 'Sexto Año'
    };

    return courseMap[course] || course
      .toLowerCase()
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}