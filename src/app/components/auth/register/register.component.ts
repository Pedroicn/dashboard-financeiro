import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password, displayName } = this.registerForm.value;

      this.authService.register(email, password, displayName).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.snackBar.open(`Conta criada com sucesso! Bem-vindo, ${user.displayName}!`, 'Fechar', {
            duration: 5000
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Erro ao criar conta. Tente novamente.';
          
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres.';
          }
          
          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000
          });
        }
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    
    if (control?.hasError('required')) {
      const fieldNames: { [key: string]: string } = {
        'displayName': 'Nome',
        'email': 'Email',
        'password': 'Senha',
        'confirmPassword': 'Confirmação de senha'
      };
      return `${fieldNames[field]} é obrigatório`;
    }
    
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    
    if (control?.hasError('minlength')) {
      if (field === 'displayName') {
        return 'Nome deve ter no mínimo 2 caracteres';
      }
      if (field === 'password') {
        return 'Senha deve ter no mínimo 6 caracteres';
      }
    }
    
    if (control?.hasError('passwordMismatch')) {
      return 'Senhas não coincidem';
    }
    
    return '';
  }
}
