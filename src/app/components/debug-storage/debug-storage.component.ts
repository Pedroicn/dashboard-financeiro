import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-storage',
  imports: [CommonModule],
  template: `
    <div style="background: #f0f0f0; padding: 20px; margin: 20px; border-radius: 8px;">
      <h3>🔍 Debug localStorage</h3>
      <p><strong>Total de chaves no localStorage:</strong> {{ totalKeys }}</p>
      <div *ngIf="storageKeys.length > 0">
        <h4>Chaves encontradas:</h4>
        <ul>
          <li *ngFor="let key of storageKeys">
            <strong>{{ key }}:</strong> {{ getStorageValue(key) | slice:0:100 }}
            <span *ngIf="getStorageValue(key).length > 100">...</span>
          </li>
        </ul>
      </div>
      <div *ngIf="storageKeys.length === 0" style="color: green;">
        ✅ localStorage está limpo!
      </div>
      <button (click)="refreshData()" style="margin: 10px; padding: 10px;">🔄 Atualizar</button>
      <button (click)="clearAll()" style="margin: 10px; padding: 10px; background: red; color: white;">🧹 Limpar Tudo</button>
    </div>
  `,
  styles: []
})
export class DebugStorageComponent implements OnInit {
  storageKeys: string[] = [];
  totalKeys = 0;

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storageKeys = Object.keys(localStorage);
      this.totalKeys = this.storageKeys.length;
      console.log('Debug: localStorage keys:', this.storageKeys);
    }
  }

  getStorageValue(key: string): string {
    return localStorage.getItem(key) || '';
  }

  clearAll() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
      console.log('Debug: localStorage cleared manually');
      this.refreshData();
    }
  }
}
