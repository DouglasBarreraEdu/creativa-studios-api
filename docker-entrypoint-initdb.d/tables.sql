CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    id_rol INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT fk_usuario_id_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id)
        ON DELETE RESTRICT
);

CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE
);

CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(70) NOT NULL UNIQUE,
    stock_actual INTEGER NOT NULL DEFAULT 0
        CHECK (stock_actual >= 0),

    stock_minimo INTEGER NOT NULL DEFAULT 0
        CHECK (stock_minimo >= 0),

    unidad_de_medida VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE producto (
    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),

    costo_base NUMERIC(10,2) NOT NULL
        CHECK(costo_base >= 0),

    codigo VARCHAR(30) UNIQUE NOT NULL,

    id_insumo_inventario INTEGER,

    created_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT fk_producto_inventario
      FOREIGN KEY(id_insumo_inventario)
      REFERENCES inventario(id)
      ON DELETE SET NULL
);

CREATE TABLE precio (
    id SERIAL PRIMARY KEY,

    margen_ganancia NUMERIC(5,2)
       CHECK(margen_ganancia >=0),

    precio_sugerido NUMERIC(10,2)
       CHECK(precio_sugerido >=0),

    id_producto INTEGER NOT NULL UNIQUE,

    CONSTRAINT fk_precio_producto
      FOREIGN KEY(id_producto)
      REFERENCES producto(id)
      ON DELETE CASCADE
);

CREATE TABLE pedido (
    id SERIAL PRIMARY KEY,

    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
      CHECK (
       estado IN (
         'pendiente',
         'produccion',
         'finalizado',
         'cancelado',
         'entregado'
       )
      ),

    fecha_creacion TIMESTAMPTZ DEFAULT now(),

    fecha_entrega DATE,

    total_pedido NUMERIC(10,2)
      CHECK(total_pedido >=0),

    id_cliente INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,

    CONSTRAINT fk_pedido_cliente
      FOREIGN KEY(id_cliente)
      REFERENCES cliente(id)
      ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_usuario
      FOREIGN KEY(id_usuario)
      REFERENCES usuario(id)
      ON DELETE RESTRICT
);

CREATE TABLE detalle_pedido (
    id SERIAL PRIMARY KEY,

    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,

    cantidad INTEGER NOT NULL
      CHECK(cantidad > 0),

    precio_unitario NUMERIC(10,2) NOT NULL
      CHECK(precio_unitario >=0),

    subtotal NUMERIC(10,2) NOT NULL
      CHECK(subtotal >=0),

    CONSTRAINT fk_detalle_pedido
      FOREIGN KEY(id_pedido)
      REFERENCES pedido(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
      FOREIGN KEY(id_producto)
      REFERENCES producto(id)
      ON DELETE RESTRICT,

    CONSTRAINT uq_producto_por_pedido
      UNIQUE(id_pedido,id_producto)
);

CREATE TABLE movimiento_inventario (
    id SERIAL PRIMARY KEY,

    tipo VARCHAR(20) NOT NULL
       CHECK (
         tipo IN (
           'entrada',
           'salida',
           'ajuste'
         )
       ),

    cantidad INTEGER NOT NULL
       CHECK(cantidad > 0),

    comentario TEXT,

    fecha_movimiento TIMESTAMPTZ DEFAULT now(),

    id_inventario INTEGER NOT NULL,

    CONSTRAINT fk_movimiento_inventario
       FOREIGN KEY(id_inventario)
       REFERENCES inventario(id)
       ON DELETE RESTRICT
);

-- Indices para optimizar consultas frecuentes

CREATE INDEX idx_pedido_estado
ON pedido(estado);

CREATE INDEX idx_pedido_cliente
ON pedido(id_cliente);

CREATE INDEX idx_pedido_usuario
ON pedido(id_usuario);

CREATE INDEX idx_detalle_pedido
ON detalle_pedido(id_pedido);

CREATE INDEX idx_movimiento_inventario
ON movimiento_inventario(id_inventario);

CREATE INDEX idx_movimiento_inventario_inventario_fecha
ON movimiento_inventario(id_inventario, fecha_movimiento DESC, id DESC);


INSERT INTO rol (nombre, descripcion) VALUES
('ADMIN', 'Dueño o administrador'),
('RECEPCION', 'Gestión de pedidos'),
('PRODUCCION', 'Equipo de producción'),
('INSTALADOR', 'Equipo instalador');
