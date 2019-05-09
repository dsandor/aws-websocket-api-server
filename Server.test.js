const Server = require('./Server');

describe('Server', () => {
  it('should init', () => {
    const server = new Server();

    expect(server).toBeDefined();
  });
});
