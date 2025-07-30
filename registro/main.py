from flask import Flask, request, redirect, render_template, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import base64
from datetime import datetime 
import psycopg2
from dotenv import load_dotenv  

load_dotenv()

app = Flask(__name__)
app.secret_key= "clavejaz"
# Carpeta para guardar imágenes subidas
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ruta principal: muestra el formulario y los registros
@app.route("/", methods=["GET"])
def home():
    accesos =[]
    try:
        conn = psycopg2.connect(
            database =os.getenv("DB_NAME"), 
            user = os.getenv("DB_USER"), 
            password= os.getenv("DB_PASSWORD"), 
            host = os.getenv("DB_HOST"), 
            port = os.getenv("DB_PORT")
        )
        cur = conn.cursor()
        cur.execute("select * from acceso")
        accesos = cur.fetchall()
        cur.close()
        conn.close()
        print("Exito al conectarse a la BD", )
    except Exception as e:
        print("Error al conectarse a la base de datos {e}", "Warning") 
    
    return render_template("index.html", accesos=accesos)

# Ruta para guardar los datos del formulario
@app.route("/crear-acceso", methods=["POST"])
def crear_acceso():
    try:    # Crear nuevo acceso
    # Firma del autorizante (archivo)
        firmaautorizacion = request.form["firmaautorizacion"]
        if "," in firmaautorizacion:
            header, encoded = firmaautorizacion.split(",", 1)
            image_data = base64.b64decode(encoded)
            timestamp= datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            firmaautorizacion = f"{timestamp}_autorizante.png"
            path_firma_autorizante = os.path.join(app.config['UPLOAD_FOLDER'], firmaautorizacion)
            with open(path_firma_autorizante, "wb") as f:
                f.write(image_data)
        else:
            return "Firma del autorizante inválida", 400

        # Firma del visitante (canvas en base64)
        firmavisitante = request.form["firmavisitante"]
        if "," in firmavisitante:
            header, encoded = firmavisitante.split(",", 1)
            image_data = base64.b64decode(encoded)
            timestamp= datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename_visitante = f"{timestamp}_visitante.png"
            path_firma_visitante = os.path.join(app.config['UPLOAD_FOLDER'], filename_visitante)
            with open(path_firma_visitante, "wb") as f:
                f.write(image_data)
        else:
            return "Firma del visitante inválida", 400

        conn = psycopg2.connect(
            database = os.getenv("DB_NAME"), 
            user= os.getenv("DB_USER"), 
            password = os.getenv("DB_PASSWORD"), 
            host =os.getenv("DB_HOST"), 
            port = os.getenv("DB_PORT")
            )
        cur = conn.cursor()

        name = request.form["name"]
        correo = request.form["email"]
        fecha = datetime.strptime(request.form["date"], '%Y-%m-%d').date()
        hora_entrada = datetime.strptime(request.form["timein"], '%H:%M').time()
        hora_salida = datetime.strptime(request.form["timeout"], '%H:%M').time()
        motivo_ingreso = request.form["motivo"]
        autorizante = request.form["autorizante"]
        observacion = request.form["observacion"]

        if hora_entrada >= hora_salida:
            flash("La hora de entrada debe ser anterior a la hora de salida", "warning")
            return redirect(url_for("home"))
        if not all([name, correo, motivo_ingreso, autorizante]):
            flash("Todos los campos obligatorios deben ser completados", "warning")
            return redirect(url_for("home"))
        
        cur.execute("""
        INSERT INTO acceso (
            nombre, correo, fecha, hora_entrada, hora_salida,
            motivo_ingreso, firma_visitante, autorizante, firma_autorizante, observacion
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            name, correo, fecha, hora_entrada, hora_salida,
            motivo_ingreso, path_firma_visitante, autorizante, path_firma_autorizante, observacion
        ))

        conn.commit()

        cur.close()
        conn.close()
        flash("Acceso guardado", "success")
    except Exception as e:
        print("{e}")
        flash(f"Error al procesar el acceso {e}" , "danger")
   
    return redirect("/")

# Inicializa la base de datos si no existe
if __name__ == "__main__":
    app.run(debug=True)
