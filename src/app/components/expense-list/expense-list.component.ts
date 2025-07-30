import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../services/expense.service';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expense-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent implements OnInit {
  expenses$: Observable<Expense[]>;
  categories: ExpenseCategory[] = [];
  filteredExpenses: Expense[] = [];
  
  // Filtros
  selectedCategory = '';
  selectedType = '';
  searchTerm = '';
  
  filterOptions = {
    types: [
      { value: '', label: 'Todos os tipos' },
      { value: 'expense', label: 'Despesas' },
      { value: 'income', label: 'Receitas' }
    ]
  };

  constructor(private expenseService: ExpenseService) {
    this.expenses$ = this.expenseService.getExpenses();
  }

  ngOnInit(): void {
    this.categories = this.expenseService.getCategories();
    
    this.expenses$.subscribe(expenses => {
      this.filteredExpenses = expenses;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.expenses$.subscribe(expenses => {
      this.filteredExpenses = expenses.filter(expense => {
        const matchesCategory = !this.selectedCategory || expense.category === this.selectedCategory;
        const matchesType = !this.selectedType || expense.type === this.selectedType;
        const matchesSearch = !this.searchTerm || 
          expense.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        return matchesCategory && matchesType && matchesSearch;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  deleteExpense(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          console.log('Despesa excluída com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir despesa:', error);
        }
      });
    }
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.icon || 'attach_money';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.color || '#95A5A6';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getTypeIcon(type: string): string {
    return type === 'expense' ? 'remove' : 'add';
  }

  getTypeColor(type: string): string {
    return type === 'expense' ? '#F44336' : '#4CAF50';
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getTotalFiltered(): { total: number; income: number; expense: number } {
    const income = this.filteredExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expense = this.filteredExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      total: income - expense,
      income,
      expense
    };
  }

  trackByExpense(index: number, expense: Expense): string {
    return expense.id;
  }
}
