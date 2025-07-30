import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ExpenseService } from '../../services/expense.service';
import { ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  categories: ExpenseCategory[] = [];
  expenseTypes = [
    { value: 'expense', label: 'Despesa' },
    { value: 'income', label: 'Receita' }
  ];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar
  ) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      date: [new Date(), Validators.required],
      type: ['expense', Validators.required],
      recurring: [false],
      recurringPeriod: ['monthly']
    });
  }

  ngOnInit(): void {
    this.categories = this.expenseService.getCategories();
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      const expense = {
        amount: parseFloat(formValue.amount),
        description: formValue.description,
        category: formValue.category,
        date: formValue.date,
        type: formValue.type,
        recurring: formValue.recurring,
        recurringPeriod: formValue.recurring ? formValue.recurringPeriod : undefined
      };

      this.expenseService.addExpense(expense).subscribe({
        next: () => {
          this.snackBar.open(
            `${formValue.type === 'expense' ? 'Despesa' : 'Receita'} adicionada com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );

          this.expenseForm.reset({
            date: new Date(),
            type: 'expense',
            recurring: false
          });
        },
        error: (error: any) => {
          console.error('Erro ao adicionar despesa:', error);
          this.snackBar.open('Erro ao adicionar despesa. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach(key => {
      this.expenseForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.expenseForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} é obrigatório`;
    }
    if (field?.hasError('min')) {
      return 'Valor deve ser maior que zero';
    }
    if (field?.hasError('minlength')) {
      return 'Descrição deve ter pelo menos 3 caracteres';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'amount': 'Valor',
      'description': 'Descrição',
      'category': 'Categoria',
      'date': 'Data'
    };
    return fieldNames[fieldName] || fieldName;
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.icon || 'attach_money';
  }
}
