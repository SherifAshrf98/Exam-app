import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { LoginData, LoginResponse } from '../../shared/auth.interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule]
})
export class LoginComponent {

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {

      this.isLoading = true;

      this.apiError = null;

      const { email, password } = this.loginForm.value 

      const data: LoginData = { email, password };

      this.loginService.login(data).subscribe({

        next: (res: LoginResponse) => {

          this.loginService.storeToken(res.data);

          const roles = this.loginService.getUserRoles();
          console.log('Decoded roles:', roles);

          if (roles.includes('Admin')) {
            this.router.navigate(['/admin/dashboard']);

          } else if (roles.includes('Student')) {
            this.router.navigate(['/student/exams-history']);
            
          } else {
            this.router.navigate(['/']);

          }
          this.isLoading = false;
        },
        error: (err) => {
          this.apiError = 'Login failed. Please check your credentials.';
          this.isLoading = false;
        }
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
