import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleChartsModule } from 'angular-google-charts';
import { CourseComparisonChartComponent } from '../course-comparison-chart/course-comparison-chart.component';
import { StudentPerformanceChartComponent } from '../student-performance-chart/student-performance-chart.component';
import { SubjectProgressChartComponent } from '../subject-progress-chart/subject-progress-chart.component';
import { StudentService } from '../../../../services/student-service.service';
import { Student } from '../../../../models/student';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    GoogleChartsModule,
    StudentPerformanceChartComponent,
    CourseComparisonChartComponent,
    SubjectProgressChartComponent
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
 students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudent: string = '';
  selectedCourse: string = '';
  selectedSubject: string = '';
  courses: string[] = [];
  subjects: string[] = ['Matematica', 'Escritura', 'Lectura', 'Disciplina'];

  isLoading: boolean = true;
  error: string = '';

  // Aggregated data for charts
  performanceData: any[] = [];
  courseComparisonData: any[] = [];
  subjectProgressData: any[] = [];
  attendanceData: any[] = [];

  private subscriptions: Subscription[] = [];


  constructor(private studentService: StudentService) { }


  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadStudents(): void {
    this.isLoading = true;
    const aux = this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...this.students];
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error cargando estudiantes: ' + err.message;
        this.isLoading = false;
      }
    });

    this.subscriptions.push(aux);
  }

  loadCourses(): void {
    const aux = this.studentService.getCourses().subscribe({
      next: (data) => {
        this.courses = data as string[];
      },
      error: (err) => {
        this.error = 'Error cargando cursos: ' + err.message;
      }
    });

    this.subscriptions.push(aux);
  }

  onFilterChange(): void {
    this.filteredStudents = this.students.filter(student => {
      let matchesStudent = true;
      let matchesCourse = true;

      if (this.selectedStudent) {
        matchesStudent = `${student.name} ${student.lastName}`.toLowerCase().includes(this.selectedStudent.toLowerCase());
      }

      if (this.selectedCourse) {
        matchesCourse = student.course === this.selectedCourse;
      }

      return matchesStudent && matchesCourse;
    });

    this.prepareChartData();
  }

  resetFilters(): void {
    this.selectedStudent = '';
    this.selectedCourse = '';
    this.selectedSubject = '';
    this.filteredStudents = [...this.students];
    this.prepareChartData();
  }

  prepareChartData(): void {
    this.preparePerformanceData();
    this.prepareCourseComparisonData();
    this.prepareSubjectProgressData();
    this.prepareAttendanceData();
  }

  preparePerformanceData(): void {
    // Generate data for individual student performance across subjects
    this.performanceData = [];

    if (this.selectedStudent && this.filteredStudents.length === 1) {
      const student = this.filteredStudents[0];
      if (student.reviews && student.reviews.length > 0) {
        const latestReview = student.reviews[student.reviews.length - 1];

        // Format: [Subject, Score]
        latestReview.results.forEach(result => {
          if (result.workedOn && result.score !== null) {
            this.performanceData.push([
              result.subject,
              result.score
            ]);
          }
        });
      }
    } else {
      // Calculate average scores for each subject across filtered students
      const subjectScores: { [key: string]: { total: number, count: number } } = {};

      this.subjects.forEach(subject => {
        subjectScores[subject] = { total: 0, count: 0 };
      });

      this.filteredStudents.forEach(student => {
        if (student.reviews && student.reviews.length > 0) {
          student.reviews.forEach(review => {
            review.results.forEach(result => {
              if (result.workedOn && result.score !== null) {
                subjectScores[result.subject].total += result.score;
                subjectScores[result.subject].count += 1;
              }
            });
          });
        }
      });

      // Convert to Google Charts format
      Object.keys(subjectScores).forEach(subject => {
        const average = subjectScores[subject].count > 0
          ? subjectScores[subject].total / subjectScores[subject].count
          : 0;

        this.performanceData.push([
          subject,
          parseFloat(average.toFixed(2))
        ]);
      });
    }
  }

  prepareCourseComparisonData(): void {
    // Generate data comparing average performance across courses
    // No inicializar con un array de encabezados
    this.courseComparisonData = [];
    
    const courseScores: { [key: string]: { [subject: string]: { total: number, count: number } } } = {};

    // Initialize data structure
    this.courses.forEach(course => {
      courseScores[course] = {};
      this.subjects.forEach(subject => {
        courseScores[course][subject] = { total: 0, count: 0 };
      });
    });

    // Filter by selected subject if any
    const subjectsToProcess = this.selectedSubject ? [this.selectedSubject] : this.subjects;

    // Collect scores by course
    this.students.forEach(student => {
      if (student.reviews && student.reviews.length > 0) {
        student.reviews.forEach(review => {
          review.results.forEach(result => {
            if (subjectsToProcess.includes(result.subject) &&
              result.workedOn &&
              result.score !== null &&
              courseScores[student.course]) {

              courseScores[student.course][result.subject].total += result.score;
              courseScores[student.course][result.subject].count += 1;
            }
          });
        });
      }
    });

    // Convert to Google Charts format - sin el encabezado
    Object.keys(courseScores).forEach(course => {
      let totalCourseScore = 0;
      let totalCourseCount = 0;

      subjectsToProcess.forEach(subject => {
        if (courseScores[course][subject]) {
          totalCourseScore += courseScores[course][subject].total;
          totalCourseCount += courseScores[course][subject].count;
        }
      });

      const average = totalCourseCount > 0
        ? totalCourseScore / totalCourseCount
        : 0;

      // Agregar solo los datos de cada curso y su promedio
      this.courseComparisonData.push([
        this.formatCourseName(course),
        parseFloat(average.toFixed(2))
      ]);
    });
  }

  prepareSubjectProgressData(): void {
    // Inicializar sin encabezados
    this.subjectProgressData = [];
    
    // Generate time-series data for progress in subjects
    const timelineData: { [date: string]: { [subject: string]: { total: number, count: number } } } = {};

    // Filter by selected subject
    const subjectsToProcess = this.selectedSubject ? [this.selectedSubject] : this.subjects;

    // Process students
    this.filteredStudents.forEach(student => {
      if (student.reviews && student.reviews.length > 0) {
        student.reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        student.reviews.forEach(review => {
          // Usar formato de fecha que funcione con Google Charts (mm/dd/yyyy)
          const reviewDate = new Date(review.date);
          const dateKey = `${reviewDate.getMonth() + 1}/${reviewDate.getDate()}/${reviewDate.getFullYear()}`;

          if (!timelineData[dateKey]) {
            timelineData[dateKey] = {};
            subjectsToProcess.forEach(subject => {
              timelineData[dateKey][subject] = { total: 0, count: 0 };
            });
          }

          review.results.forEach(result => {
            if (subjectsToProcess.includes(result.subject) &&
              result.workedOn &&
              result.score !== null) {

              timelineData[dateKey][result.subject].total += result.score;
              timelineData[dateKey][result.subject].count += 1;
            }
          });
        });
      }
    });

    // Convert to Google Charts format
    const dates = Object.keys(timelineData).sort((a, b) => {
      // Ordenar fechas correctamente
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Asegurarnos de que tengamos datos antes de proceder
    if (dates.length === 0) {
      // No hay datos, agregamos una fila vacía para evitar errores
      const emptyRow = ['No hay datos'];
      this.subjectProgressData.push(emptyRow);
      return;
    }

    // Agregar datos para cada fecha
    dates.forEach(date => {
      const row: any[] = [date]; // La fecha es el primer elemento

      subjectsToProcess.forEach(subject => {
        const subjectData = timelineData[date][subject];
        const average = subjectData && subjectData.count > 0
          ? subjectData.total / subjectData.count
          : 0; // Usar 0 en lugar de null para evitar errores

        row.push(parseFloat(average.toFixed(2)));
      });

      this.subjectProgressData.push(row);
    });
  }

  prepareAttendanceData(): void {
    // Generate attendance data for the filtered students
    const attendanceByStudent: { [name: string]: number } = {};

    this.filteredStudents.forEach(student => {
      const studentName = `${student.name} ${student.lastName}`;
      attendanceByStudent[studentName] = student.assistance || 0;
    });

    // Convert to Google Charts format - inicializar sin encabezados
    this.attendanceData = [];

    Object.keys(attendanceByStudent).forEach(name => {
      this.attendanceData.push([name, attendanceByStudent[name]]);
    });

    // Handle case when there are too many students
    if (this.attendanceData.length > 10) { // Mostrar solo los 10 mejores
      // Only show top 10 by attendance
      this.attendanceData.sort((a, b) => b[1] - a[1]); // Sort by attendance
      this.attendanceData = this.attendanceData.slice(0, 10);
    }
  }

  formatCourseName(course: string): string {
    if (!course) return '';

    // Convert course names like 'PRIMER_GRADO' to 'Primer Grado'
    return course
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
