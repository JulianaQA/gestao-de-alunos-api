import request from 'supertest';
import app from '../../src/app.js';

export async function loginAdmin(credenciais) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: credenciais.email, senha: credenciais.senha });

  if (response.status !== 200) {
    throw new Error(`Falha no login do admin: ${JSON.stringify(response.body)}`);
  }
  return response.body.token;
}

export async function loginAluno(credenciais) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: credenciais.email, senha: credenciais.senha });

  if (response.status !== 200) {
    throw new Error(`Falha no login do aluno: ${JSON.stringify(response.body)}`);
  }
  return response.body.token;
}