import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titulo: string = 'Inicio de sesión';
  usuario: Usuario;

  constructor(private authService: AuthService, private router: Router) {
    // Tambien se puede inicializar en el mismo atributo
    this.usuario = new Usuario();
  }

  ngOnInit(): void {
    if(this.authService.isAuthenticated()){
      swal.fire('Login', 'Ya hay una sesión iniciada.', 'info');
      this.router.navigate(['/clientes']);
    }
  }

  login(): void {
    console.log(this.usuario);
    if(this.usuario.username == null || this.usuario.password == null ) {
      swal.fire('Error login', 'No puede haber campos vacíos', 'error');
      return;
    }

    this.authService.login(this.usuario).subscribe(response => {
      console.log(response);
      // Con atob desencriptamos el token en base 64
      // Hay que convertirlo a JSON porque se obtiene en string
      // Esta siendo manejado en autho.service entonces ya no es necesario aca
      //let objetoPayload = JSON.parse(atob(response.access_token.split(".")[1]));
      //console.log(objetoPayload);

      // El token trae varios datos del usuario
      this.authService.guardarUsuario(response.access_token);
      this.authService.guardarToken(response.access_token);

      // Se use el metodo getter pero sin (), es decir .usuario
      let usuario = this.authService.usuario;

      //swal.fire('Login', `Hola ${objetoPayload.user_name}, iniciaste sesión con éxito`, 'success');
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
        title: `Bienvenido ${usuario.username}, iniciaste sesión con éxito.`
      })
      this.router.navigate(['/clientes']);

    }, err => {
      if(err.status == 400) {
        swal.fire('Login incorrecto', 'Verificar que los datos ingresados sean válidos', 'warning');
      }
    }
  );
  }

}
