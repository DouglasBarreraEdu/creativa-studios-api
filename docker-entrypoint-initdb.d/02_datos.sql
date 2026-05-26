--
-- PostgreSQL database dump
--

\restrict I8JCfk2gbqQEG25zUIgnKt9O8paRWxdKULUf9STg8QPm9ZXYSzGjCxfnY4pqobV

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cliente (id, nombre_comercial, nombre_contacto, telefono, email, direccion) VALUES (1, 'Detalles Creativos SV', 'Sofía Morales', '7000-0001', 'detallescreativos@gmail.com', 'Colonia Escalón, Santa Ana');
INSERT INTO public.cliente (id, nombre_comercial, nombre_contacto, telefono, email, direccion) VALUES (2, 'Regalos Personalizados Hernández', 'Carlos Hernández', '7000-0002', 'regaloshernandez@gmail.com', 'El Trébol, Santa Ana');


--
-- Data for Name: inventario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventario (id, nombre, stock_actual, stock_minimo, unidad_de_medida, created_at) VALUES (5, 'Camiseta blanca talla L para sublimar', 10, 5, 'unidad', '2026-05-26 01:20:49.602774+00');
INSERT INTO public.inventario (id, nombre, stock_actual, stock_minimo, unidad_de_medida, created_at) VALUES (4, 'Camiseta blanca talla M para sublimar', 15, 5, 'unidad', '2026-05-26 01:20:34.978258+00');
INSERT INTO public.inventario (id, nombre, stock_actual, stock_minimo, unidad_de_medida, created_at) VALUES (2, 'Lapicero tinta negra para personalizar nombre', 17, 20, 'unidad', '2026-05-26 01:20:05.081525+00');
INSERT INTO public.inventario (id, nombre, stock_actual, stock_minimo, unidad_de_medida, created_at) VALUES (1, 'Taza pequeña blanca para sublimar', 9, 10, 'unidad', '2026-05-26 01:19:40.486011+00');
INSERT INTO public.inventario (id, nombre, stock_actual, stock_minimo, unidad_de_medida, created_at) VALUES (3, 'Camiseta blanca talla S para sublimar', 8, 5, 'unidad', '2026-05-26 01:20:24.456773+00');


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.rol (id, nombre, descripcion) VALUES (1, 'ADMIN', 'Dueño o administrador');
INSERT INTO public.rol (id, nombre, descripcion) VALUES (2, 'RECEPCION', 'Gestión de pedidos');
INSERT INTO public.rol (id, nombre, descripcion) VALUES (3, 'PRODUCCION', 'Equipo de producción');
INSERT INTO public.rol (id, nombre, descripcion) VALUES (4, 'INSTALADOR', 'Equipo instalador');


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuario (id, nombre, email, contrasena, id_rol, created_at) VALUES (1, 'Douglas Barrera', 'admin@gmail.com', '$2b$10$dOFhBreYibxJ/9Gp3vUYyOCJadj18PY29jGArA9sOT0kdYyzJoyri', 1, '2026-05-26 01:06:11.868636+00');
INSERT INTO public.usuario (id, nombre, email, contrasena, id_rol, created_at) VALUES (2, 'Hazel Calderón', 'recepcion@gmail.com', '$2b$10$Y.8mB5i2x5XFLzhE0s6u.ukl7CWawf10EFu7F5hYKZ9NAnbtJ7SNO', 2, '2026-05-26 01:06:11.868636+00');
INSERT INTO public.usuario (id, nombre, email, contrasena, id_rol, created_at) VALUES (3, 'Gabriel Calderón', 'produccion@gmail.com', '$2b$10$AJnOSqjFVsJyYiDOKBGddeBN1nDomMn86TLhrxEXw4Pp4d0aRYcdu', 3, '2026-05-26 01:06:11.868636+00');
INSERT INTO public.usuario (id, nombre, email, contrasena, id_rol, created_at) VALUES (4, 'Ricardo Heredia', 'instalador@gmail.com', '$2b$10$cemLaKXScGEXQOmg4C37j.s4t4WXstmAkohv108SfBx7QRaAT1WwG', 4, '2026-05-26 01:06:11.868636+00');


--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pedido (id, estado, fecha_creacion, fecha_entrega, total_pedido, id_cliente, id_usuario) VALUES (1, 'entregado', '2026-05-26 01:39:34.726088+00', '2026-05-26', 6.98, 2, 1);
INSERT INTO public.pedido (id, estado, fecha_creacion, fecha_entrega, total_pedido, id_cliente, id_usuario) VALUES (2, 'pendiente', '2026-05-26 01:40:20.300282+00', '2026-05-27', 5.50, 1, 1);


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.producto (id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at) VALUES (1, 'Taza personalizada pequeña blanca', 'producto', 2.50, 'PROD-TAZA-001', 1, '2026-05-26 01:30:58.523814+00');
INSERT INTO public.producto (id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at) VALUES (2, 'Lapicero personalizado con nombre', 'producto', 0.75, 'PROD-LAPICERO-001', 2, '2026-05-26 01:31:20.24022+00');
INSERT INTO public.producto (id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at) VALUES (3, 'Camiseta personalizada blanca talla S', 'producto', 4.50, 'PROD-CAM-S-001', 3, '2026-05-26 01:31:42.10644+00');
INSERT INTO public.producto (id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at) VALUES (4, 'Camiseta personalizada blanca talla M', 'producto', 4.75, 'PROD-CAM-M-001', 4, '2026-05-26 01:32:01.709946+00');
INSERT INTO public.producto (id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at) VALUES (5, 'Camiseta personalizada blanca talla L', 'producto', 5.00, 'PROD-CAM-L-001', 5, '2026-05-26 01:32:23.50658+00');


--
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (1, 1, 3, 1, 6.98, 6.98);
INSERT INTO public.detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (2, 2, 2, 1, 1.50, 1.50);
INSERT INTO public.detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (3, 2, 1, 1, 4.00, 4.00);


--
-- Data for Name: instalacion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: movimiento_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (1, 'entrada', 10, 'Entrada inicial', '2026-05-26 01:26:42.672639+00', 5);
INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (2, 'entrada', 15, 'Entrada inicial', '2026-05-26 01:26:51.185895+00', 4);
INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (3, 'entrada', 9, 'Entrada inicial', '2026-05-26 01:27:01.99365+00', 3);
INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (4, 'entrada', 17, 'Entrada inicial', '2026-05-26 01:27:11.907046+00', 2);
INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (5, 'entrada', 9, 'Entrada inicial', '2026-05-26 01:27:22.438+00', 1);
INSERT INTO public.movimiento_inventario (id, tipo, cantidad, comentario, fecha_movimiento, id_inventario) VALUES (6, 'salida', 1, 'Consumo por pedido PED-0001', '2026-05-26 01:39:43.091146+00', 3);


--
-- Data for Name: precio; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.precio (id, margen_ganancia, precio_sugerido, id_producto) VALUES (1, 60.00, 4.00, 1);
INSERT INTO public.precio (id, margen_ganancia, precio_sugerido, id_producto) VALUES (2, 100.00, 1.50, 2);
INSERT INTO public.precio (id, margen_ganancia, precio_sugerido, id_producto) VALUES (3, 55.00, 6.98, 3);
INSERT INTO public.precio (id, margen_ganancia, precio_sugerido, id_producto) VALUES (4, 55.00, 7.36, 4);
INSERT INTO public.precio (id, margen_ganancia, precio_sugerido, id_producto) VALUES (5, 55.00, 7.75, 5);


--
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_seq', 2, true);


--
-- Name: detalle_pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_pedido_id_seq', 3, true);


--
-- Name: instalacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.instalacion_id_seq', 1, false);


--
-- Name: inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventario_id_seq', 5, true);


--
-- Name: movimiento_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimiento_inventario_id_seq', 6, true);


--
-- Name: pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_id_seq', 2, true);


--
-- Name: precio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.precio_id_seq', 5, true);


--
-- Name: producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_id_seq', 5, true);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rol_id_seq', 4, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict I8JCfk2gbqQEG25zUIgnKt9O8paRWxdKULUf9STg8QPm9ZXYSzGjCxfnY4pqobV

