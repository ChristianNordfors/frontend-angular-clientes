import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Usuario } from '../usuarios/usuario';
import { AuthService } from '../usuarios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  title: string = 'App Angular'
  usuario: Usuario;

  constructor(public authService: AuthService, private router: Router) {
    // Tambien se puede inicializar en el mismo atributo
    this.usuario = new Usuario();
  }

  ngOnInit(): void {
  }

  logout() {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    Toast.fire({
      //icon: 'success',
      title: `El usuario ${this.authService.usuario.username} cerró la sesión.`
    })
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // loginNav(): void {
  //   console.log(this.usuario);
  //
  //
  //   this.authService.login(this.usuario).subscribe(response => {
  //     console.log(response);
  //
  //     let objetoPayload = JSON.parse(atob(response.access_token.split(".")[1]));
  //     console.log(objetoPayload);
  //
  //     const Toast = Swal.mixin({
  //       toast: true,
  //       position: 'top',
  //       showConfirmButton: false,
  //       timer: 4000,
  //       timerProgressBar: true,
  //       onOpen: (toast) => {
  //         toast.addEventListener('mouseenter', Swal.stopTimer)
  //         toast.addEventListener('mouseleave', Swal.resumeTimer)
  //       }
  //     })
  //
  //     Toast.fire({
  //       //icon: 'success',
  //       title: `Bienvenido ${objetoPayload.user_name}, iniciaste sesión con éxito.`
  //     })
  //     this.router.navigate(['/clientes']);
  //   });
  // }

  }
