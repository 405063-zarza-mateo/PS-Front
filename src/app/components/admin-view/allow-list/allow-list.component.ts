import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Teacher } from '../../../models/teacher';
import { StudentService } from '../../../services/student-service.service';
import { TeacherService } from '../../../services/teacher-service.service';
import { Router } from '@angular/router';
import { AdminViewService } from '../../../services/admin-view-service.service';

@Component({
  selector: 'app-allow-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allow-list.component.html',
  styleUrl: './allow-list.component.scss'
})
export class AllowListComponent {

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isLoading = true;
  searchTerm = '';
  error = '';
  selectedCourse = 'Curso...'; 
  successMessage = '';

  courses: String[] = [];



  private subscriptions: Subscription[] = [];
  
  constructor(
    private adminViewService: AdminViewService,
    private studentService: StudentService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
        this.loadTeachers();
        this.loadCourses();
      }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
    loadTeachers(): void {
      this.isLoading = true;
  
      const subscription = this.adminViewService.getPendingTeachers().subscribe({
        next: (data) => {
          this.teachers = data;
          this.applyFilters(); 
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar los profesores:', err);
          this.error = 'No se pudieron cargar los profesores. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
  
      this.subscriptions.push(subscription);
    }
  
    onSearch(event: Event): void {
      const target = event.target as HTMLInputElement;
      this.searchTerm = target.value;
      this.applyFilters();
    }
  
    onCourseChange(event: Event): void {
      const target = event.target as HTMLSelectElement;
      this.selectedCourse = target.value;
      this.applyFilters();
    }
  
    applyFilters(): void {
      let result = [...this.teachers];
      
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase().trim();
        result = result.filter(teacher =>
          teacher.name.toLowerCase().includes(term) ||
          teacher.lastName.toLowerCase().includes(term) ||
          teacher.course.toLowerCase().includes(term)
        );
      }
      
      if (this.selectedCourse && this.selectedCourse !== 'Curso...') {
        result = result.filter(teacher => teacher.course === this.selectedCourse);
      }
      
      this.filteredTeachers = result;
    }
  
    searchTeachers(): void {
      this.applyFilters(); 
    }

      
    loadCourses() {
      this.isLoading = true;
  
      const subscription = this.studentService.getCourses().subscribe({
        next: (data) => {
          this.courses = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar los cursos:', err);
          this.isLoading = false;
        }
      });
  
      this.subscriptions.push(subscription);
    }
  
    resetCourseFilter(): void {
      this.selectedCourse = 'Curso...';
      this.applyFilters();
    }
  
    denyRequest(teacher: number) {
      const subscription = this.adminViewService.denyTeacher(teacher).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.successMessage = "Profesor denegado con éxito" 
          this.loadTeachers();

        },
        error: (err) => {
          console.error('Error al denegar profesor:', err);
          this.isLoading = false;
        }
      });
  
      this.subscriptions.push(subscription);
      }

      acceptRequest(teacher: number) {
        const subscription = this.adminViewService.approveTeacher(teacher).subscribe({
          next: (data) => {
            this.isLoading = false;
            this.successMessage = "Profesor aceptado con éxito" 
            this.loadTeachers();
          },
          error: (err) => {
            console.error('Error al aceptar profesor:', err);
            this.isLoading = false;
          }
        });
    
        this.subscriptions.push(subscription);
        }

}
