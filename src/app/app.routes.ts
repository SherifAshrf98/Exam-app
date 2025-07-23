import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { StudentRegistrationComponent } from './auth/student-registration/student-registration.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: StudentRegistrationComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'students', loadComponent: () => import('./features/admin/students/students.component').then(m => m.StudentsComponent) },
      { path: 'exams', loadComponent: () => import('./features/admin/exams/exams.component').then(m => m.ExamsComponent) },
      { path: 'create-question', loadComponent: () => import('./features/admin/create-question/create-question.component').then(m => m.CreateQuestionComponent) },
      { path: 'exam-configurations', loadComponent: () => import('./features/admin/exam-configurations/exam-configurations.component').then(m => m.ExamConfigurationsComponent) },
    ]
  },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Student'] },
    children: [
      { path: 'exams-history', loadComponent: () => import('./features/student/exams-history/exams-history.component').then(m => m.ExamsHistoryComponent) },
      { path: 'take-exam', loadComponent: () => import('./features/student/take-exam/take-exam.component').then(m => m.TakeExamComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
