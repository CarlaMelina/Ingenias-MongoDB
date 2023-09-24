
// servidor 
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// incluyo funciones declaradas en mongodb.js
const { connectToMongodb, disconnectToMongodb} = require('./mongodb')
//Middleware
app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});
app.use(express.json());



//Endpoints
app.get('/productos', async (req, res) => {
    const client = await connectToMongodb();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('Ingenias')
    const productos = await db.collection('productos').find().toArray()
    await disconnectToMongodb()
    res.json(productos)
});

app.get('/productos/:nombre', async (req, res) => {
    const nombreProducto = req.params.nombre
    
    const client = await connectToMongodb();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const regex = new RegExp(nombreProducto.toLowerCase(), 'i');
    const db = client.db('Ingenias')
    const productos = await db.collection('productos').find({ nombre: regex}).toArray()
    await disconnectToMongodb()
    productos.length == 0 ? res.status(404).send('No encontre la fruta con el nombre '+ nombreProducto): res.json(productos)
})

// Metodo de creacion
app.post('/productos', async (req, res) => { 
    const nuevoProducto = req.body
    if (nuevoProducto === undefined) {
        res.status(400).send('Error en el formato de los datos de la fruta')
    }
    const client = await connectToMongodb();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('Ingenias') 
    const collection = await db.collection('productos').insertOne(nuevoProducto)
        .then(() => {
            console.log('Nueva fruta creada')
            res.status(201).send(nuevoProducto)
        }).catch(err => { 
            console.error(err)
        }).finally(() => { client.close()})
})

// Metodo de actualizacion
app.put('/productos/:id', async (req, res) => { 
    const id = parseInt(req.params.id) || 0;
    const nuevosDatos = req.body
    if (!nuevosDatos) {
        res.status(400).send('Error en el formato de los datos recibidos')
    }
    const client = await connectToMongodb();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('frutas') 
    
    const collection = await db.collection('Ingenias').updateOne({ id: id }, { $set: nuevosDatos })
        .then(() => {
            let mensaje ='Producto actualizado ID : ' + id
          res.status(200).json({ descripcion: mensaje , objeto: nuevosDatos})
        }).catch(err => { 
            let mensaje = 'Error al actualizar ID: ' + id 
            console.error(err)
            res.status(500).json({descripcion : mensaje, objeto: nuevosDatos})
        }).finally(() => {
            client.close()
        })
})


app.delete('/productos/:id', async (req, res) => { 
    const id = req.params.id;
    if (!id) {
        res.status(400).send('Error en el formato del id recibido')
    }
    const client = await connectToMongodb();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    client.connect()
        .then(() => { 
            const collection = client.db('Ingenias').collection('productos')
            return collection.deleteOne({id: parseInt(id)})
        }).then((resultado) => {
            if (resultado.deletedCount === 0) {
                res.status(404).send('No se pudo encontrarel producto con id: '+id)
            } else {
                console.log('producto eliminado')
                res.status(204).send('producto eliminado')
            }
        }).catch((err) => {
            console.error(err)
             res.status(500).send('Error al eliminar el producto')
        }).finally(() => {
            client.close()
        })
})


app.get("*", (req, res) => {
  res.json({
    error: "404",
    message: "No se encuentra la ruta solicitada",
  });
});

//Inicia el servidor
app.listen(PORT, () => console.log(`Conexión exitosa en http://localhost:${PORT}`) );