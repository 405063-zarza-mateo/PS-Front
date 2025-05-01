import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';
import { TeacherService } from '../../../services/teacher-service.service';
import { Subscription, interval, filter, switchMap } from 'rxjs';
import { AdminViewService } from '../../../services/admin-view-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  toAccept = 0;

  constructor(private authService: AuthService, private teacherService: AdminViewService,   private router: Router) { }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.authService.isAdmin;
  
      if (this.isLoggedIn && this.isAdmin) {
        this.loadPendingTeachers();
      }
    });
  
    // Detectar cambios de ruta y recargar solicitudes si corresponde
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.urlAfterRedirects;
        if (this.isLoggedIn && this.isAdmin ) {
          this.loadPendingTeachers();
        }
      }
    });
  }

  ngOnDestroy(): void {
  }

  loadPendingTeachers(): void {
    this.teacherService.getPendingTeachers().subscribe(teachers => {
      this.toAccept = teachers.length;
    });
  }



  logout(): void {
    this.authService.logout();
  }
}