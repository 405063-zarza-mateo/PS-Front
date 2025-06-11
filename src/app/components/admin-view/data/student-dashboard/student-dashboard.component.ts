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
import { Teacher } from '../../../../models/teacher';
import { TeacherService } from '../../../../services/teacher-service.service';
import { AdminViewService } from '../../../../services/admin-view-service.service';
import { AssistanceDto } from '../../../../models/assistanceDto';
import { StudentAttendanceChartComponent } from '../student-attendance-chart/student-attendance-chart.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    GoogleChartsModule,
    StudentPerformanceChartComponent,
    CourseComparisonChartComponent,
    SubjectProgressChartComponent, StudentAttendanceChartComponent],

  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  // Datos base
  students: Student[] = [];
  teachers: Teacher[] = [];
  filteredStudents: Student[] = [];
  filteredTeachers: Teacher[] = [];
  
  // Filtros principales
  selectedUserType: 'students' | 'teachers' = 'students';
  selectedPerson: string = '';
  selectedCourse: string = '';
  selectedSubject: string = '';
  
  courses: string[] = [];
  subjects: string[] = ['Matematica', 'Escritura', 'Lectura', 'Disciplina'];

  isLoading: boolean = true;
  error: string = '';

  // Datos agregados para gráficos de rendimiento (solo estudiantes)
  performanceData: any[] = [];
  courseComparisonData: any[] = [];
  subjectProgressData: any[] = [];
  assistanceData: AssistanceDto[] = [];

  // Datos agregados para gráficos de asistencia

  private subscriptions: Subscription[] = [];

  constructor(
    private studentService: StudentService,
    private teacherService: AdminViewService // Asume que existe
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    this.isLoading = true;
    
    // Cargar estudiantes
    const studentsSubscription = this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...this.students];
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Error cargando estudiantes: ' + err.message;
        this.isLoading = false;
      }
    });

    // Cargar profesores
    const teachersSubscription = this.teacherService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.filteredTeachers = [...this.teachers];
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Error cargando profesores: ' + err.message;
        this.isLoading = false;
      }
    });

    this.subscriptions.push(studentsSubscription, teachersSubscription);
  }

  loadCourses(): void {
    const coursesSubscription = this.studentService.getCourses().subscribe({
      next: (data) => {
        this.courses = data as string[];
      },
      error: (err) => {
        this.error = 'Error cargando cursos: ' + err.message;
      }
    });

    this.subscriptions.push(coursesSubscription);
  }

  private checkLoadingComplete(): void {
    if (this.students.length >= 0 && this.teachers.length >= 0) {
      this.prepareAllChartData();
      this.isLoading = false;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
    this.prepareAllChartData();
  }

  private applyFilters(): void {
    if (this.selectedUserType === 'students') {
      this.filteredStudents = this.students.filter(student => {
        let matchesPerson = true;
        let matchesCourse = true;

        if (this.selectedPerson) {
          matchesPerson = `${student.name} ${student.lastName}`.toLowerCase()
            .includes(this.selectedPerson.toLowerCase());
        }

        if (this.selectedCourse) {
          matchesCourse = student.course === this.selectedCourse;
        }

        return matchesPerson && matchesCourse;
      });
    } else {
      this.filteredTeachers = this.teachers.filter(teacher => {
        let matchesPerson = true;
        let matchesCourse = true;

        if (this.selectedPerson) {
          matchesPerson = `${teacher.name} ${teacher.lastName}`.toLowerCase()
            .includes(this.selectedPerson.toLowerCase());
        }

        if (this.selectedCourse) {
          matchesCourse = teacher.course === this.selectedCourse;
        }

        return matchesPerson && matchesCourse;
      });
    }
  }

  resetFilters(): void {
    this.selectedPerson = '';
    this.selectedCourse = '';
    this.selectedSubject = '';
    
    this.filteredStudents = [...this.students];
    this.filteredTeachers = [...this.teachers];
    
    this.prepareAllChartData();
  }

  prepareAllChartData(): void {
      this.preparePerformanceData();
      this.prepareCourseComparisonData();
      this.prepareSubjectProgressData();
          this.loadAssistanceData(); 

    
  }

  // Métodos para gráficos de rendimiento (solo estudiantes)
  preparePerformanceData(): void {
    this.performanceData = [];

    if (this.selectedPerson && this.filteredStudents.length === 1) {
      const student = this.filteredStudents[0];
      if (student.reviews && student.reviews.length > 0) {
        const latestReview = student.reviews[student.reviews.length - 1];

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
      const subjectScores: { [key: string]: { total: number, count: number } } = {};

      this.subjects.forEach(subject => {
        subjectScores[subject] = { total: 0, count: 0 };
      });

      this.filteredStudents.forEach(student => {
        if (student.reviews && student.reviews.length > 0) {
          student.reviews.forEach(review => {
            review.results.forEach(result => {
              if (result.workedOn && result.score !== null ) {
                subjectScores[result.subject].total += result.score;
                subjectScores[result.subject].count += 1;
              }
            });
          });
        }
      });

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
    this.courseComparisonData = [];
    
    const courseScores: { [key: string]: { [subject: string]: { total: number, count: number } } } = {};

    this.courses.forEach(course => {
      courseScores[course] = {};
      this.subjects.forEach(subject => {
        courseScores[course][subject] = { total: 0, count: 0 };
      });
    });

    const subjectsToProcess = this.selectedSubject ? [this.selectedSubject] : this.subjects;

    this.students.forEach(student => {
      if (student.reviews && student.reviews.length > 0) {
        student.reviews.forEach(review => {
          review.results.forEach(result => {
            if (subjectsToProcess.includes(result.subject) &&
              result.workedOn &&
              result.score !== null &&
              courseScores[student.course] && result.subject != "Disciplina") {

              courseScores[student.course][result.subject].total += result.score;
              courseScores[student.course][result.subject].count += 1;
            }
          });
        });
      }
    });

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

      this.courseComparisonData.push([
        this.formatCourseName(course),
        parseFloat(average.toFixed(2))
      ]);
    });
  }

  prepareSubjectProgressData(): void {
    this.subjectProgressData = [];
    
    const timelineData: { [date: string]: { [subject: string]: { total: number, count: number } } } = {};
    const subjectsToProcess = this.selectedSubject ? [this.selectedSubject] : this.subjects;

    this.filteredStudents.forEach(student => {
      if (student.reviews && student.reviews.length > 0) {
        student.reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        student.reviews.forEach(review => {
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

    const dates = Object.keys(timelineData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    if (dates.length === 0) {
      this.subjectProgressData = [];
      return;
    }

    dates.forEach(date => {
      const row: any[] = [date];

      subjectsToProcess.forEach(subject => {
        const subjectData = timelineData[date][subject];
        const average = subjectData && subjectData.count > 0
          ? subjectData.total / subjectData.count
          : 0;

        row.push(parseFloat(average.toFixed(2)));
      });

      this.subjectProgressData.push(row);
    });
  }

  // Métodos para gráficos de asistencia

  // Métodos de eventos
  onDateRangeChange(dateRange: { startDate: string, endDate: string }): void {
    console.log('Rango de fechas de rendimiento actualizado:', dateRange);
  }



  formatCourseName(course: string): string {
    if (!course) return '';

    return course
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}


loadAssistanceData(): void {
  const assistanceSubscription = this.studentService.getStudentAssistances().subscribe({
    next: (data) => {
      // INCLUIR todos los datos, incluyendo TOTAL
      this.assistanceData = data.map(item => {
        let processedDate: Date;
        
        // Manejar diferentes formatos de fecha desde el backend
       
          processedDate = new Date(item.date);
        
        
        return {
          ...item,
          date: processedDate,
          assistance: typeof item.assistance === 'number' ? item.assistance : Number(item.assistance) || 0
        };
      });
      
      console.log('Datos de asistencia procesados (con TOTAL):', this.assistanceData);
    },
    error: (err) => {
      this.error = 'Error cargando asistencias: ' + err.message;
    }
  });

  this.subscriptions.push(assistanceSubscription);
}

}