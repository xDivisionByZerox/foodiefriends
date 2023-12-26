const {UserController} = require('../controllers/userController');
const UserModel = require('../../models/userModel');

jest.mock('../models/userModel', () => ({
  ifUserExist: jest.fn(),
  newUser: jest.fn(),
}));

jest.mock('../models/connectDb', () => ({
  getConnection: jest.fn(),
}));

describe('UserController', () => {
  describe('createUser', () => {
    it('should create a new user when user does not exist', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(), 
      };
      require('../../models/userModel').ifUserExist.mockImplementation((email, callback) => {
        callback(null, []);
      });

      require('../../models/userModel').newUser.mockImplementation((email, password, callback) => {
        callback(null, { ok: true });
      });

      require('./connectDb').getConnection.mockImplementation((callback) => {
        callback(null, { query: jest.fn() });
      });

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200); 
      expect(res.json).toHaveBeenCalledWith({ ok: true }); 

      require('../../models/userModel').ifUserExist.mockRestore();
      require('../../models/userModel').newUser.mockRestore();
      require('./connectDb').getConnection.mockRestore();
    });

  });
});