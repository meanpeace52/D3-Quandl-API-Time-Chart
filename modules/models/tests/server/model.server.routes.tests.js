'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Model = mongoose.model('Model'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, model;

/**
 * Model routes tests
 */
describe('Model CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Model
    user.save(function () {
      model = {
        name: 'Model name'
      };

      done();
    });
  });

  it('should be able to save a Model if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Model
        agent.post('/api/models')
          .send(model)
          .expect(200)
          .end(function (modelSaveErr, modelSaveRes) {
            // Handle Model save error
            if (modelSaveErr) {
              return done(modelSaveErr);
            }

            // Get a list of Models
            agent.get('/api/models')
              .end(function (modelsGetErr, modelsGetRes) {
                // Handle Model save error
                if (modelsGetErr) {
                  return done(modelsGetErr);
                }

                // Get Models list
                var models = modelsGetRes.body;

                // Set assertions
                (models[0].user._id).should.equal(userId);
                (models[0].name).should.match('Model name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Model if not logged in', function (done) {
    agent.post('/api/models')
      .send(model)
      .expect(403)
      .end(function (modelSaveErr, modelSaveRes) {
        // Call the assertion callback
        done(modelSaveErr);
      });
  });

  it('should not be able to save an Model if no name is provided', function (done) {
    // Invalidate name field
    model.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Model
        agent.post('/api/models')
          .send(model)
          .expect(400)
          .end(function (modelSaveErr, modelSaveRes) {
            // Set message assertion
            (modelSaveRes.body.message).should.match('Please fill Model name');

            // Handle Model save error
            done(modelSaveErr);
          });
      });
  });

  it('should be able to update an Model if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Model
        agent.post('/api/models')
          .send(model)
          .expect(200)
          .end(function (modelSaveErr, modelSaveRes) {
            // Handle Model save error
            if (modelSaveErr) {
              return done(modelSaveErr);
            }

            // Update Model name
            model.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Model
            agent.put('/api/models/' + modelSaveRes.body._id)
              .send(model)
              .expect(200)
              .end(function (modelUpdateErr, modelUpdateRes) {
                // Handle Model update error
                if (modelUpdateErr) {
                  return done(modelUpdateErr);
                }

                // Set assertions
                (modelUpdateRes.body._id).should.equal(modelSaveRes.body._id);
                (modelUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Models if not signed in', function (done) {
    // Create new Model model instance
    var modelObj = new Model(model);

    // Save the model
    modelObj.save(function () {
      // Request Models
      request(app).get('/api/models')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Model if not signed in', function (done) {
    // Create new Model model instance
    var modelObj = new Model(model);

    // Save the Model
    modelObj.save(function () {
      request(app).get('/api/models/' + modelObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', model.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Model with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/models/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Model is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Model which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Model
    request(app).get('/api/models/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Model with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Model if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Model
        agent.post('/api/models')
          .send(model)
          .expect(200)
          .end(function (modelSaveErr, modelSaveRes) {
            // Handle Model save error
            if (modelSaveErr) {
              return done(modelSaveErr);
            }

            // Delete an existing Model
            agent.delete('/api/models/' + modelSaveRes.body._id)
              .send(model)
              .expect(200)
              .end(function (modelDeleteErr, modelDeleteRes) {
                // Handle model error error
                if (modelDeleteErr) {
                  return done(modelDeleteErr);
                }

                // Set assertions
                (modelDeleteRes.body._id).should.equal(modelSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Model if not signed in', function (done) {
    // Set Model user
    model.user = user;

    // Create new Model model instance
    var modelObj = new Model(model);

    // Save the Model
    modelObj.save(function () {
      // Try deleting Model
      request(app).delete('/api/models/' + modelObj._id)
        .expect(403)
        .end(function (modelDeleteErr, modelDeleteRes) {
          // Set message assertion
          (modelDeleteRes.body.message).should.match('User is not authorized');

          // Handle Model error error
          done(modelDeleteErr);
        });

    });
  });

  it('should be able to get a single Model that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Model
          agent.post('/api/models')
            .send(model)
            .expect(200)
            .end(function (modelSaveErr, modelSaveRes) {
              // Handle Model save error
              if (modelSaveErr) {
                return done(modelSaveErr);
              }

              // Set assertions on new Model
              (modelSaveRes.body.name).should.equal(model.name);
              should.exist(modelSaveRes.body.user);
              should.equal(modelSaveRes.body.user._id, orphanId);

              // force the Model to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Model
                    agent.get('/api/models/' + modelSaveRes.body._id)
                      .expect(200)
                      .end(function (modelInfoErr, modelInfoRes) {
                        // Handle Model error
                        if (modelInfoErr) {
                          return done(modelInfoErr);
                        }

                        // Set assertions
                        (modelInfoRes.body._id).should.equal(modelSaveRes.body._id);
                        (modelInfoRes.body.name).should.equal(model.name);
                        should.equal(modelInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Model.remove().exec(done);
    });
  });
});
