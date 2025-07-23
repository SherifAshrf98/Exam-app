import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { RegistrationData, RegistrationResponse } from '../../shared/auth.interfaces';

@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.component.html',
  styleUrls: ['./student-registration.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule]
})
export class StudentRegistrationComponent {
  registrationForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  apiSuccess: string | null = null;
  apiError: string[] | null = null;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6),Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.errors && confirmPassword.errors['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit() {
    if (this.registrationForm.valid) {

      this.isLoading = true;

      this.apiSuccess = null;

      this.apiError = null;

      const { firstName, lastName, username, email, password } = this.registrationForm.value;

      const data: RegistrationData = { firstName, lastName, username, email, password };
      
      this.registrationService.register(data).subscribe({

        next: (res: RegistrationResponse) => {

          this.isLoading = false;
          
          this.apiSuccess = res.message;

          this.apiError = null;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        },

        error: (err) => {

          this.isLoading = false;

          this.apiSuccess = null;

          if (Array.isArray(err?.error?.errors)) {
            this.apiError = err.error.errors;

          } else if (err?.error?.message) {
            this.apiError = [err.error.message];

          } else {
            this.apiError = ['Registration failed.'];
          }
        }
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnInit() {
    console.log('StudentRegistrationComponent loaded!');
  }
}
