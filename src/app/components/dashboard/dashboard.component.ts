import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { ChartsComponent } from '../charts/charts.component';
import { GoalsComponent } from '../goals/goals.component';
import { AiSuggestionsComponent } from '../ai-suggestions/ai-suggestions.component';

import { ExpenseService } from '../../services/expense.service';
import { GoalsService } from '../../services/goals.service';
import { AiService } from '../../services/ai.service';
import { ExpenseSummary } from '../../models/expense.model';
import { Goal } from '../../models/goal.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    ExpenseFormComponent,
    ExpenseListComponent,
    ChartsComponent,
    GoalsComponent,
    AiSuggestionsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  summary: ExpenseSummary = {
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    expensesByCategory: {},
    monthlyTrend: []
  };

  constructor(
    private expenseService: ExpenseService,
    private goalsService: GoalsService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.generateAISuggestions();

    // Atualizar dados quando houver mudanças
    this.expenseService.getExpenses().subscribe(() => {
      this.loadSummary();
      this.generateAISuggestions();
    });

    this.goalsService.getGoals().subscribe(() => {
      this.generateAISuggestions();
    });
  }

  private loadSummary(): void {
    this.summary = this.expenseService.getExpenseSummary();
  }

  private generateAISuggestions(): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      this.goalsService.getGoals().subscribe((goals: Goal[]) => {
        this.aiService.generateSuggestions(expenses, goals, this.summary);
      });
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
