
# 🏭 Sistema de Acceso

Aplicación web desarrollada con **Python (Flask)** y **PostgreSQL**, que permite gestionar el acceso de personal a una fábrica o datacenter.

---

## 📦 Tecnologías usadas

- Python 3.x
- Flask
- HTML / CSS / JavaScript
- PostgreSQL
- SQLAlchemy
- Jinja2

---

## 🚀 Instalación paso a paso

### 1. Clonar el proyecto (o copiarlo)

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
````

---

### 2. Crear y activar un entorno virtual

```bash
python -m venv venv
```

#### Activar entorno virtual:

* En **CMD**:

```bash
venv\Scripts\activate
```

* En **PowerShell**:

```bash
.\venv\Scripts\Activate.ps1
```

---

### 3. Instalar dependencias del proyecto

```bash
pip install -r requirements.txt
```

---

## 🛠️ Configuración de la base de datos

### 4. Crear la base de datos en PostgreSQL

1. Asegurate de que el servidor PostgreSQL esté corriendo.
2. Abrí una terminal y ejecutá:

```bash
createdb -U postgres acceso_datacenter
```

> Si `createdb` no está en el PATH, podés crear la base desde **pgAdmin** o usar `psql`.

---

### 5. Restaurar el esquema de la base de datos

Ubicá tu archivo `modelo.sql` 

```bash
psql -U usuario -d nombre_bd -f "ubicacion\modelo.sql"
```

---

## 🔐 Configuración de variables de entorno

### 6. Agrega el archivo `.env` en la raíz del proyecto

## ▶️ Ejecutar la aplicación

Con el entorno virtual activado:

```bash
flask run
```

Abrí tu navegador en:
📍 [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🧪 Verificar que las tablas estén creadas

Podés entrar a PostgreSQL con:

```bash
psql -U postgres -d acceso_datacenter
```

Y luego escribir:

```sql
\dt
```

Para ver todas las tablas.

