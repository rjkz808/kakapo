require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { BadRequest, InternalServerError, NotFound } = require('http-errors');
const Chant = require('./models/Chant');

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());

function generateChantCode() {
  return ' '
    .repeat(6)
    .replace(/./g, () => Math.floor(Math.random() * 10).toString(10));
}

app.get('/chants/:code', async (req, res, next) => {
  const code = parseInt(req.params.code, 10);
  try {
    const chant = await Chant.findOne({ code });
    if (!chant) {
      next(new NotFound(`Chant with code ${code} is not found`));
    } else {
      res.send(chant);
    }
  } catch {
    next(new InternalServerError('Failed to query chant from db'));
  }
});

app.post('/chants', async (req, res, next) => {
  let code = generateChantCode();
  try {
    // TODO: make use of some cache storage (redis)
    while (await Chant.exists({ code })) {
      code = generateChantCode();
    }
  } catch {
    return next(new InternalServerError('Failed to request chant by code'));
  }

  console.log(req.body);
  console.log(code);
  const chant = new Chant({ ...req.body, code });
  try {
    await chant.save();
    res.send({ code });
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      console.error(e);
      next(new BadRequest('Invalid chant data'));
    } else {
      next(new InternalServerError('Failed to save chant in db'));
    }
  }

  // TODO: delete chants after they expire
});

app.use((req, res, next) => {
  next(new NotFound(`Path ${req.path} not found`));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    message: err.message || 'Something went wrong',
  });
});

async function main() {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  if (process.env.DB_USER && process.env.DB_PASS) {
    options.authSource = 'admin';
    options.auth = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    };
  }

  await mongoose.connect(
    process.env.DB_URI || 'mongodb://localhost/kakapoDB',
    options
  );

  const srv = http.createServer(app);
  const port = parseInt(process.env.PORT, 10) || 3000;

  await new Promise((resolve, reject) => {
    srv.once('listening', resolve);
    srv.once('error', reject);
    srv.listen(port);
  });
  console.log(`listening at :${port}`);
}

main().catch((err) => {
  console.error(err);
});
