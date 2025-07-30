import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CleanupService } from './services/cleanup.service';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { map, filter, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private authService = inject(AuthService);
  // private cleanupService = inject(CleanupService); // DESABILITADO TEMPORARIAMENTE
  private router = inject(Router);
  
  title = 'Dashboard Financeiro';
  
  // Observable para verificar se estamos em uma página de auth
  isAuthPage$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((event: NavigationEnd) => {
      return event.url.includes('/login') || event.url.includes('/register');
    }),
    startWith(this.router.url.includes('/login') || this.router.url.includes('/register'))
  );
  
  // Observable do usuário logado
  user$ = this.authService.user$;
}
