import mongoose from 'mongoose';

export const mochaHooks = {
  afterAll(done) {
    mongoose.connection.close()
      .then(() => done())
      .catch(done);
  }
};