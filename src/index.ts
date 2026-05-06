import express from 'express'
import morgan from 'morgan'
import swaggerDocumentation from '../docs/swagger/swagger_output.json' with { type: 'json' }
import swaggerUI from 'swagger-ui-express'

import { PORT } from './config.js'
import authRouter from './routes/auth.routes.js'
import inventarioRouter from './routes/inventario.routes.js'
import movimientoInventarioRouter from './routes/movimiento-inventario.routes.js'
import productoRouter from './routes/producto.routes.js'
import precioRouter from './routes/precio.routes.js'

const app = express()

const SERVER_STARTED_AT = Date.now()

// Transforma el cuerpo de la solicitud en formato JSON
app.use(express.json())

// Muestra los log de las solicitudes HTTP en la consola
app.use(morgan('dev'))

// Muestra si la API está corriendo en el navegador
app.use(express.static('public'))

// Docs
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation))

// Rutas
app.use('/api/auth', authRouter)
app.use('/api/inventario', inventarioRouter)
app.use('/api/movimientos', movimientoInventarioRouter)
app.use('/api/producto', productoRouter)
app.use('/api/precio', precioRouter)

// Ruta de salud para verificar que la API está funcionando
app.get(
  '/health',
  /* #swagger.tags = ['Health'] */
  (req, res) => {
    const now = Date.now()
    const uptimeSeconds = Math.floor((now - SERVER_STARTED_AT) / 1000)

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'creativa-studios-api',
        message: 'API está corriendo correctamente',
        uptimeSeconds,
        timestamp: new Date(now).toLocaleString('es-SV'),
      },
    })
  },
)

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log('===============================')
  console.log(`Server is running on port ${PORT}`)
  console.log('===============================')

  // logs
  console.log('\n--Server logs\n')
})
