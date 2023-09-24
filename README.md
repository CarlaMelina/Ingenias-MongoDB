# Documentación de la API

Esta es la documentación de la API desarrollada para gestionar productos en una base de datos MongoDB.

## Definición de Datos

La API se encarga de gestionar productos, que tienen la siguiente estructura:

```json
{
    "codigo": número,
    "nombre": "string",
    "precio": número,
    "categoria": "string"
}

Importación de Datos
Los datos se importan a la base de datos MongoDB utilizando la API.

Endpoints Funcionales
Consulta de Productos
GET /productos
Este endpoint permite consultar todos los productos almacenados en la base de datos.

Ejemplo de solicitud:

