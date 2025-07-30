import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user, User as FirebaseUser, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, of, catchError } from 'rxjs';
import { User, UserProfile } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Observable do usuário atual
  user$ = user(this.auth);
  
  // Observable do perfil do usuário atual (simplificado sem Firestore)
  userProfile$: Observable<UserProfile | null> = this.user$.pipe(
    map(user => {
      if (!user) return null;
      
      return {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'Usuário',
        createdAt: new Date(user.metadata.creationTime!),
        preferences: {
          currency: 'BRL',
          language: 'pt-BR',
          theme: 'light'
        }
      } as UserProfile;
    })
  );

  constructor() {
    // Os serviços irão reagir automaticamente às mudanças de usuário
    // através dos observables getCurrentUserId()
  }

  // Login com email e senha
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(result => this.mapFirebaseUser(result.user))
    );
  }

  // Registro com email e senha (versão simplificada sem Firestore)
  register(email: string, password: string, displayName: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(result => {
        // Atualizar o perfil com o nome
        return from(updateProfile(result.user, { displayName })).pipe(
          map(() => this.mapFirebaseUser(result.user))
        );
      })
    );
  }

  // Logout
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  // Verificar se o usuário está logado
  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  // Obter o UID do usuário atual
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // Mapear usuário do Firebase para nossa interface
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(firebaseUser.metadata.creationTime!),
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime!)
    };
  }

  // Método para recarregar dados dos serviços quando usuário faz login
  reloadUserData(): void {
    // Este método pode ser chamado pelos componentes após login bem-sucedido
    // para recarregar os dados específicos do usuário
  }
}
