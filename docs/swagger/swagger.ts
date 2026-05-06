import swaggerAutogen from 'swagger-autogen'

const outputFile = './docs/swagger/swagger_output.json'
const endpointsFiles = ['./src/index.ts']

const doc = {
  info: {
    title: 'Creativa Studios API',
    description: 'API documentation for Creativa Studios',
  },
  host: 'localhost:4000',
  schemes: ['http'],
  tags: [
    {
      name: 'Auth',
      description: 'Autenticación',
    },
    {
      name: 'Health',
      description: 'Salud de la API',
    },
    {
      name: 'Inventario',
      description: 'Gestión de inventario',
    },
    {
      name: 'Producto',
      description: 'Gestion de productos',
    },
    {
      name: 'Precio',
      description: 'Gestión de precios',
    },
  ],
}

swaggerAutogen()(outputFile, endpointsFiles, doc)
