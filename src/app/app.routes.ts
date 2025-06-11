import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './guards/auth.guard';
import { DonationSuccessComponent } from './components/general/donations/donation-success/donation-success.component';
import { DonationFailureComponent } from './components/general/donations/donation-failure/donation-failure.component';
import { DonationPendingComponent } from './components/general/donations/donation-pending/donation-pending.component';
import { DonationComponent } from './components/general/donations/donation/donation.component';

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
    },
    {
        path: 'terms',
        loadComponent: () => import('./components/general/terms-and-conditions/terms-and-conditions.component').then(m => m.TermsAndConditionsComponent)
    },
{
        path: 'faq',
        loadComponent: () => import('./components/general/faq/faq.component').then(m => m.FaqComponent)
    },
    {
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
            .then(m => m.TeachersListComponent), canActivate: [adminGuard]
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
        path: 'dashboard',
        loadComponent: () => import('./components/admin-view/data/student-dashboard/student-dashboard.component')
            .then(m => m.StudentDashboardComponent), canActivate: [authGuard, adminGuard]
    },

    {
        path: 'students/admin',
        loadComponent: () => import('./components/admin-view/data/student-list-admin/student-list-admin.component')
            .then(m => m.StudentListAdminComponent), canActivate: [authGuard, adminGuard]
    },
    {
        path: 'donation', loadComponent: () => import('./components/general/donations/donation/donation.component')
            .then(m => m.DonationComponent)
    },
    {
        path: 'donation/success', loadComponent: () => import('./components/general/donations/donation-success/donation-success.component')
            .then(m => m.DonationSuccessComponent)
    },
    {
        path: 'donation/failure', loadComponent: () => import('./components/general/donations/donation-failure/donation-failure.component')
            .then(m => m.DonationFailureComponent)
    },
    {
        path: 'donation/pending', loadComponent: () => import('./components/general/donations/donation-pending/donation-pending.component')
            .then(m => m.DonationPendingComponent)
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
