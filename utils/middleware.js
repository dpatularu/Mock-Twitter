const jwt = require('jsonwebtoken');

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Error: Tweet does not exist' });
  } if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: 'Authentication failed: token either missing or invalid' });
  }

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  }
  next();
};

const userExtractor = async (request, response, next) => {
  request.user = jwt.verify(request.token, process.env.SECRET);
  if (!request.user.id) {
    return response.status(401).json({ error: 'Authentication failed: token either missing or invalid' });
  }
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Error: Unknown endpoint' });
};

module.exports = {
  tokenExtractor,
  userExtractor,
  errorHandler,
  unknownEndpoint,
};
