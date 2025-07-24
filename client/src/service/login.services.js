import axios from 'axios';
import { saveToken } from './token';

export const login = async (usuario, password) => {
  try {
    const response = await axios.post(`/api/login`, {
      usuario,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// 🔒 Login automático com usuário fixo
export const loginAutomatico = async () => {
  const usuarioFixo = 'sergio1';
  const senhaFixa = '7854';

  try {
    const data = await login(usuarioFixo, senhaFixa);
    if (data.access_token) {
      saveToken(data.access_token);
      sessionStorage.setItem('username', "vendedora");
      console.log('Login automático realizado com sucesso');
    } else {
      console.error('Token não retornado pelo login.');
    }
  } catch (error) {
    console.error('Erro no login automático:', error);
  }
};
