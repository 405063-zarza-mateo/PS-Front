import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Teacher } from '../../../models/teacher';
import { AuthService } from '../../../services/auth-service.service';
import { TeacherService } from '../../../services/teacher-service.service';
import { Router } from '@angular/router';
import { StudentService } from '../../../services/student-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewTeacherComponent } from "../view-teacher/view-teacher.component";
import { AdminViewService } from '../../../services/admin-view-service.service';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ViewTeacherComponent],
  templateUrl: './teachers-list.component.html',
  styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent implements OnInit, OnDestroy {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isAdmin = false;
  isLoading = true;
  searchTerm = '';
  error = '';
  selectedCourse = 'Curso...'; 
  successMessage = '';

  courses: String[] = [];

  isDeleteModalOpen = false;
  isDetailsModalOpen = false;
  selectedTeacher: Teacher | null = null;
  teacherToDeleteId: number | null = null;


  private subscriptions: Subscription[] = [];
  
  constructor(
    private teacherService: TeacherService,
    private adminViewService : AdminViewService,
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
  
      const subscription = this.adminViewService.getTeachers().subscribe({
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
  
    openDetailsModal(id: number): void {
      const teacherFromList = this.teachers.find(s => s.id === id);
  
      if (teacherFromList ) {
        this.selectedTeacher = teacherFromList;
        this.isDetailsModalOpen = true;
      } else {
        this.isLoading = true;
  
        const subscription = this.teacherService.getTeacherById(id).subscribe({
          next: (teacher) => {
            this.selectedTeacher = teacher;
            this.isDetailsModalOpen = true;
            this.isLoading = false;
          },
          error: (err) => {
            console.error(`Error al cargar los detalles del alumno ${id}:`, err);
            this.error = 'No se pudieron cargar los detalles del alumno. Por favor, intente nuevamente.';
            this.isLoading = false;
          }
        });
  
        this.subscriptions.push(subscription);
      }
    }
  

  
    closeDetailsModal(): void {
      this.isDetailsModalOpen = false;
      this.selectedTeacher = null;
    }
  
    openDeleteModal(id: number): void {
      const teacher = this.teachers.find(s => s.id === id);
      if (teacher) {
        this.selectedTeacher = teacher;
        this.teacherToDeleteId = id;
        this.isDeleteModalOpen = true;
      }
    }
  
    closeDeleteModal(): void {
      this.isDeleteModalOpen = false;
      this.selectedTeacher = null;
      this.teacherToDeleteId = null;
    }
  
    confirmDelete(id: number): void {
      const subscription = this.teacherService.deleteTeacher(id).subscribe({
        next: () => {
          this.teachers = this.teachers.filter(teacher => teacher.id !== id);
          this.applyFilters(); 
          this.closeDeleteModal();
          this.successMessage = 'Profesor eliminado con éxito.';
        },
        error: (err) => {
          console.error('Error al eliminar el profesor:', err);
          this.error = 'No se pudo eliminar el profesor. Por favor, intente nuevamente.';
          this.closeDeleteModal();
        }
      });
  
      this.subscriptions.push(subscription);
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
  
}