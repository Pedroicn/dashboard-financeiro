import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BudgetLimitService } from '../../services/budget-limit.service';
import { ExpenseService } from '../../services/expense.service';
import { BudgetLimit, CategoryBudget } from '../../models/budget-limit.model';
import { ExpenseCategory } from '../../models/expense.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-budget-limits',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './budget-limits.component.html',
  styleUrl: './budget-limits.component.scss'
})
export class BudgetLimitsComponent implements OnInit {
  budgetForm: FormGroup;
  categories: ExpenseCategory[] = [];
  budgetLimits$: Observable<BudgetLimit[]>;
  categoryBudgets$: Observable<CategoryBudget[]>;

  constructor(
    private fb: FormBuilder,
    private budgetLimitService: BudgetLimitService,
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar
  ) {
    this.budgetForm = this.fb.group({
      categoryName: ['', [Validators.required]],
      monthlyLimit: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.budgetLimits$ = this.budgetLimitService.getBudgetLimits();
    this.categoryBudgets$ = this.budgetLimitService.getCategoryBudgets();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = this.expenseService.getCategories();
  }

  async onSubmit(): Promise<void> {
    if (this.budgetForm.valid) {
      try {
        const { categoryName, monthlyLimit } = this.budgetForm.value;
        
        await this.budgetLimitService.setBudgetLimit(categoryName, monthlyLimit);
        
        this.snackBar.open(
          '✅ Limite de orçamento definido com sucesso!',
          'Fechar',
          { duration: 3000 }
        );

        this.budgetForm.reset();
      } catch (error) {
        console.error('Erro ao definir limite:', error);
        this.snackBar.open(
          '❌ Erro ao definir limite de orçamento',
          'Fechar',
          { duration: 3000 }
        );
      }
    }
  }

  async deleteBudgetLimit(categoryName: string): Promise<void> {
    try {
      await this.budgetLimitService.deleteBudgetLimit(categoryName);
      
      this.snackBar.open(
        '🗑️ Limite removido com sucesso!',
        'Fechar',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Erro ao remover limite:', error);
      this.snackBar.open(
        '❌ Erro ao remover limite',
        'Fechar',
        { duration: 3000 }
      );
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getProgressBarColor(categoryBudget: CategoryBudget): string {
    if (categoryBudget.isOverBudget) return 'warn';
    if (categoryBudget.percentageUsed > 80) return 'accent';
    return 'primary';
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.icon || 'category';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.color || '#666';
  }

  getErrorMessage(field: string): string {
    const control = this.budgetForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('min')) {
      return 'O valor deve ser maior que zero';
    }
    return '';
  }

  trackByCategory(index: number, budget: CategoryBudget): string {
    return budget.categoryName;
  }

  refreshBudgets(): void {
    this.budgetLimitService.recalculateBudgets();
    this.snackBar.open(
      '🔄 Orçamentos atualizados!',
      'Fechar',
      { duration: 2000 }
    );
  }

  // Expor Math para usar no template
  Math = Math;
}
