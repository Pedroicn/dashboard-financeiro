import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AiService } from '../../services/ai.service';
import { AISuggestion } from '../../models/ai.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ai-suggestions',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  templateUrl: './ai-suggestions.component.html',
  styleUrl: './ai-suggestions.component.scss'
})
export class AiSuggestionsComponent implements OnInit {
  suggestions$: Observable<AISuggestion[]>;
  groupedSuggestions: { [key: string]: AISuggestion[] } = {};

  suggestionTypes = {
    'spending_cut': {
      label: 'Cortes de Gastos',
      icon: 'content_cut',
      color: '#F44336'
    },
    'saving_opportunity': {
      label: 'Oportunidades de Economia',
      icon: 'savings',
      color: '#4CAF50'
    },
    'budget_adjustment': {
      label: 'Ajustes de Orçamento',
      icon: 'tune',
      color: '#FF9800'
    },
    'goal_recommendation': {
      label: 'Recomendações de Metas',
      icon: 'flag',
      color: '#2196F3'
    }
  };

  constructor(
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {
    this.suggestions$ = this.aiService.getSuggestions();
  }

  ngOnInit(): void {
    this.suggestions$.subscribe(suggestions => {
      this.groupSuggestions(suggestions);
    });
  }

  private groupSuggestions(suggestions: AISuggestion[]): void {
    this.groupedSuggestions = suggestions.reduce((groups, suggestion) => {
      const type = suggestion.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(suggestion);
      return groups;
    }, {} as { [key: string]: AISuggestion[] });

    // Ordenar por prioridade dentro de cada grupo
    Object.keys(this.groupedSuggestions).forEach(type => {
      this.groupedSuggestions[type].sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    });
  }

  getTypeInfo(type: string): any {
    return this.suggestionTypes[type as keyof typeof this.suggestionTypes] || {
      label: type,
      icon: 'lightbulb',
      color: '#95A5A6'
    };
  }

  getPriorityColor(priority: string): string {
    const colors = {
      'high': '#F44336',
      'medium': '#FF9800',
      'low': '#4CAF50'
    };
    return colors[priority as keyof typeof colors] || '#95A5A6';
  }

  getPriorityIcon(priority: string): string {
    const icons = {
      'high': 'priority_high',
      'medium': 'remove',
      'low': 'expand_more'
    };
    return icons[priority as keyof typeof icons] || 'info';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getTotalSuggestions(): number {
    return Object.values(this.groupedSuggestions)
      .reduce((total, suggestions) => total + suggestions.length, 0);
  }

  getTotalPotentialSavings(): number {
    return Object.values(this.groupedSuggestions)
      .flat()
      .reduce((total, suggestion) => total + (suggestion.impact || 0), 0);
  }

  trackBySuggestion(index: number, suggestion: AISuggestion): string {
    return suggestion.id;
  }
}
