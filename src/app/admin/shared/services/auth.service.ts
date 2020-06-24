import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FbAuthResponse, User} from '../interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthService {

  public error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {
  }

  get token(): string {
    const expireDate = new Date(localStorage.getItem('fb-token-expires'));
    if (new Date() > expireDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('fb-token');
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}
`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))
      );
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleError(err: HttpErrorResponse) {
    const {message} = err.error.error;

    switch (message) {
      case 'EMAIL_NOT_FOUND':
        this.error$.next('This email is not registered');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Wrong password');
        break;
      case 'INVALID_EMAIL':
        this.error$.next('Wrong email address');
        break;
    }

    return throwError(err);
  }

  private setToken(resp: FbAuthResponse | null) {
    if (resp) {
      const expireDate = new Date(new Date().getTime() + +resp.expiresIn * 1000);
      localStorage.setItem('fb-token', resp.idToken);
      localStorage.setItem('fb-token-expires', expireDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
