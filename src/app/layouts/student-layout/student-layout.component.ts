import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class StudentLayoutComponent {
  headerTitle = 'Dashboard';
  userName: string | null = null;

  constructor(private router: Router, private loginService: LoginService) {
    this.setHeaderTitle(this.router.url);
    this.userName = this.loginService.getUserName();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.setHeaderTitle(e.urlAfterRedirects || e.url);
    });
  }

  setHeaderTitle(url: string) {
    if (url.includes('/student/exams-history')) this.headerTitle = 'Exams History';
    else if (url.includes('/student/take-exam')) this.headerTitle = 'Take Exam';
    else this.headerTitle = 'Dashboard';
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
