---
title: Continuidad de Negocio con Velero y Longhorn
publishDate: 2026-03-01 00:00:00
img: /assets/disaster-recovery.png
img_alt: Escena isométrica 3D elegante que muestra un servidor siendo respaldado en una nube brillante para la recuperación de datos
description: |
  Estrategia integral de recuperación ante desastres con backups distribuidos, snapshots de volúmenes y pruebas de restauración.
tags:
  - Backup
  - Disaster Recovery
  - Velero
  - Longhorn
  - S3
---

> Garantizando la resiliencia absoluta de los datos mediante cronogramas de backup automatizados y procedimientos de restauración verificados.

## Resumen del Proyecto

La alta disponibilidad no es lo mismo que un backup. Este proyecto abordó la necesidad crítica de una estrategia de **Recuperación ante Desastres (DR)** que cubra tanto la configuración de la infraestructura como los datos persistentes. Al utilizar Velero y Longhorn, el cluster está preparado para cualquier cosa, desde un archivo borrado accidentalmente hasta un fallo total de hardware.

### Características Clave

- **Backups de Cluster con Velero**: Snapshots automatizados de todo el estado de Kubernetes (Namespaces, ConfigMaps, Secrets, Workloads) almacenados de forma segura en un S3 externo.
- **Réplicas de Volúmenes Distribuidas**: Longhorn proporciona resiliencia local replicando cada bloque de datos entre múltiples nodos físicos.
- **Backups Externos de Volúmenes**: Exportación periódica de snapshots incrementales de volúmenes persistentes a un bucket S3, asegurando la supervivencia de los datos ante una caída total del cluster.
- **Restauración Validada**: Implementación de un flujo de pruebas de restauración periódicas para verificar la integridad de los backups y calcular el RTO (Recovery Time Objective).

### Tecnologías Utilizadas

- Velero
- Longhorn Distributed Storage
- MinIO (almacenamiento compatible con S3)
- Restic (para backups a nivel de sistema de archivos)
- 1Password (para credenciales críticas de DR)

Esta estrategia transformó el HomeLab de una configuración experimental "frágil" a un entorno "resiliente" similar a producción, capaz de sobrevivir a eventos catastróficos.
