const app = require("express")();
const { ok } = require("assert");
const bodyParser = require("body-parser");

// Servidor HTTP
const http = require("http").Server(app);

// Servidor para socket.io, aquí RECIBIMOS mensajes
// Nos aseguramos que podemos recibir referencias cruzadas
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/"
});

// Cliente
const ioc = require("socket.io-client");

// Argumentos de linea de comandos
var myArgs = process.argv.slice(2);

// Puerto es el primer argumento que se pasa
const port = process.env.PORT || myArgs[0];

// Se almacenan los mensajes recibidos
var mensajes = [];

// Se usa para ENVIAR mensajes
var socketOut = null;

app.get("/", (req, res) => {
  res.send("ASCP framework");
});

const cors = require("cors")
// Permitimos JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors);

app.post("/test", (req, res) => {
  console.log("Got body:", req.body);
  res.sendStatus(200);
});

// Conectar a otro host
app.get("/conectar", (req, res) => {
  console.log(req.query.host);
  res.send("Host " + req.query.host);
  socketOut = ioc.connect(req.query.host);
  console.log(socketOut);
});

// Enviar mensaje al host al que se encuentra conectado
app.get("/enviar_mensaje", (req, res) => {
  res.send("Mensaje " + req.query.msg);
  socketOut.emit("Mensaje ASCP", req.query.msg);
});

//Enviar mensaje al host al que se encuentra conectado
app.post("/enviar_mensaje", (req, res) => {
  console.log("Got body:", req.body);
  // res.sendStatus(200);
  res.send("Mensaje: " + req.body.data);
  socketOut.emit("Mensaje ASCP", req.body);
});

// Obtener el último mensaje
app.get("/obtener_ultimo_mensaje", (req, res) => {
  res.send("Ultimo: " + mensajes[mensajes.length - 1]);
});

// Recibir mensajes
io.on("connection", (socket) => {
  console.log(`${socket.id} se ha conectado`);

  socket.on("Mensaje ASCP", (ascp_msg) => {
    console.log(socket.id + " " + JSON.stringify(ascp_msg));
    mensajes.push(ascp_msg);
    io.emit("Mensaje ASCP", ascp_msg);
    if(ascp_msg.function === 1) {
      io.emit("Mensaje ASC", ascp_msg);
    }
  });
});

// Escuchar en el puerto especificado en la línea de comandos
http.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}/`);
});
