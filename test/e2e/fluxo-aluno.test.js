import { expect } from 'chai';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../../src/app.js';
import { loginAdmin, loginAluno } from '../helpers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dados = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'dados.json'), 'utf-8')
);

describe('Fluxo E2E: Admin cadastra aluno e aluno registra trabalho', function () {
  this.timeout(15000);

  let adminToken;
  let alunoToken;
  let alunoId;

  before(async function () {
    adminToken = await loginAdmin(dados.admin);
    expect(adminToken).to.be.a('string');
  });

  it('deve cadastrar um novo aluno com sucesso', async function () {
    const response = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dados.novoAluno);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.nome).to.equal(dados.novoAluno.nome);
    expect(response.body.email).to.equal(dados.novoAluno.email);

    alunoId = response.body.id;
  });

  it('deve fazer login como o aluno recém-cadastrado', async function () {
    alunoToken = await loginAluno({
      email: dados.novoAluno.email,
      senha: dados.novoAluno.senha,
    });
    expect(alunoToken).to.be.a('string');
  });
  
  it('deve matricular o aluno na disciplina antes de registrar o trabalho', async function () {
    const response = await request(app)
      .post(`/api/admin/disciplinas/${dados.trabalho.disciplinaId}/matriculas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ alunoId });

    expect(response.status).to.be.oneOf([200, 201]);
  });

  it('deve registrar a entrega de um trabalho como aluno', async function () {
    const response = await request(app)
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send(dados.trabalho);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.titulo).to.equal(dados.trabalho.titulo);
    expect(response.body.disciplinaId).to.equal(dados.trabalho.disciplinaId);
  });
});