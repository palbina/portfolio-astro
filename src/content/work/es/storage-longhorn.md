---
title: "Almacenamiento Distribuido: Longhorn"
publishDate: 2026-03-01 00:00:00
img: /assets/storage-longhorn.png
img_alt: Una representación isométrica en 3D de nodos de almacenamiento altamente disponibles y distribuidos
description: |
  Implementación de Longhorn como sistema de bloques distribuidos nativo de la nube para proveer alta disponibilidad a aplicaciones con estado (stateful).
tags:
  - Almacenamiento Distribuido
  - Longhorn
  - Alta Disponibilidad
  - Cargas Stateful
  - Volúmenes Persistentes
---

> Garantizar que los datos persistan a fallos de hardware catastróficos mediante la sincronización a nivel de bloques a través de múltiples dispositivos físicos inconexos.

## Visión General

Gestionar sistemas "con estado" (bases de datos) en Kubernetes es un reto constante. Para solucionar la dependencia del hardware, se desplegó Longhorn como el proveedor primario de almacenamiento de bloques distribuido del entorno HomeLab.

Al abstraer el almacenamiento local NVMe de los nodos de trabajo en un gran grupo unificado, las cargas como clústers de PostgreSQL o bases vectoriales Qdrant pueden programarse libremente en cualquier punto sin amarrarlas al dominio de falla de un nodo físico.

### Características Clave

- **Replicación por Bloques**: La información inscrita a un volumen (PVC) es replicada sincrónicamente hasta en 3 nodos distintos, automáticamente y en tiempo real.
- **Microservicios Cloud-Native**: El propio controlador de almacenamiento no utiliza engorrosos módulos a nivel kernel; corre en espacio de usuario directamente dentro de Kubernetes como contenedores.
- **Reconstrucción Automática por Nodo**: Si un servidor físico pierde poder o falla, puede ingresarse un nodo fresco para ocupar su lugar y Longhorn reconstruirá la réplica de los datos ausente en segundo plano sin tu intervención.
- **Snapshots Desacoplados**: Se envían respaldos incrementales silenciosos y recurrentes de bases de datos críticas a almacenamiento seguro en la nube y AWS S3.

### Tecnologías Empleadas

- CNCF Longhorn
- CRDs para Gestión Volumétrica
- AWS S3 Integration
- Talos Linux NVMe integration

Este proyecto ilustra un enfoque a la computación concurrente de bajo nivel para preservar la cordura y fiabilidad total de los sistemas estáticos de manera autónoma.
