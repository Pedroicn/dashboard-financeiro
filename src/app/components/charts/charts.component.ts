import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseSummary } from '../../models/expense.model';

@Component({
  selector: 'app-charts',
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart', { static: true }) categoryChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart', { static: true }) trendChart!: ElementRef<HTMLCanvasElement>;

  private categoryChartInstance?: Chart;
  private trendChartInstance?: Chart;
  private isBrowser: boolean;
  
  summary: ExpenseSummary = {
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    expensesByCategory: {},
    monthlyTrend: []
  };

  constructor(
    private expenseService: ExpenseService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      Chart.register(...registerables);
    }
  }

  ngOnInit(): void {
    this.loadData();
    
    this.expenseService.getExpenses().subscribe(() => {
      this.loadData();
      if (this.isBrowser) {
        this.updateCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.updateCharts();
    }
  }

  private loadData(): void {
    this.summary = this.expenseService.getExpenseSummary();
  }

  private updateCharts(): void {
    this.createCategoryChart();
    this.createTrendChart();
  }

  private createCategoryChart(): void {
    if (!this.isBrowser) return;
    
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }

    const ctx = this.categoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const categories = Object.keys(this.summary.expensesByCategory);
    const amounts = Object.values(this.summary.expensesByCategory);
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#95A5A6', '#F39C12'
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = amounts.reduce((sum, amount) => sum + amount, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.categoryChartInstance = new Chart(ctx, config);
  }

  private createTrendChart(): void {
    if (!this.isBrowser) return;
    
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    const ctx = this.trendChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const months = this.summary.monthlyTrend.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });
    const amounts = this.summary.monthlyTrend.map(item => item.amount);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Gastos Mensais',
          data: amounts,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FF6B6B',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Gastos: ${this.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatCurrency(Number(value))
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    };

    this.trendChartInstance = new Chart(ctx, config);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
