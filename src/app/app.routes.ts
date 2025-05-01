import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./components/users/login/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/users/register/register.component')
            .then(m => m.RegisterComponent)
    },
    {
        path: 'register/waiting',
        loadComponent: () => import('./components/users/waiting-confirmation/waiting-confirmation.component')
            .then(m => m.WaitingConfirmationComponent)     
    }, {

        path: 'reset-password',
        loadComponent: () => import('./components/users/recovery/recovery.component')
            .then(m => m.RecoveryComponent)
    }, {
        path: 'home',
        loadComponent: () => import('./components/general/landing/landing.component')
            .then(m => m.LandingComponent)
    }, {
        path: 'students',
        loadComponent: () => import('./components/students/students-list/students-list.component')
            .then(m => m.StudentsListComponent), canActivate: [authGuard]
    },
    {
        path: 'students/id',
        loadComponent: () => import('./components/students/view-student/view-student.component')
            .then(m => m.ViewStudentComponent), canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./components/general/profile/profile.component')
            .then(m => m.ProfileComponent), canActivate: [authGuard]
    },
    {
        path: 'teachers',
        loadComponent: () => import('./components/admin-view/teachers-list/teachers-list.component')
            .then(m => m.TeachersListComponent), canActivate: [ adminGuard]
    },
    {
        path: 'allow-list',
        loadComponent: () => import('./components/admin-view/allow-list/allow-list.component')
            .then(m => m.AllowListComponent), canActivate: [authGuard, adminGuard]
    },
    {
        path: 'teacher-log',
        loadComponent: () => import('./components/admin-view/teacher-log/teacher-log.component')
            .then(m => m.TeacherLogComponent), canActivate: [authGuard, adminGuard]
    },
    {
        path: 'inventory',
        loadComponent: () => import('./components/admin-view/inventory/inventory-list/inventory-list.component')
            .then(m => m.InventoryListComponent), canActivate: [authGuard, adminGuard]
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
