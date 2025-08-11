from flask import Flask, request, redirect, render_template, url_for, flash, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import base64
from datetime import datetime, date
import psycopg2
from dotenv import load_dotenv  
import pdfkit

load_dotenv()

app = Flask(__name__)
app.secret_key= "clavejaz"
# Carpeta para guardar imágenes subidas
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ruta principal: muestra el formulario y los registros
@app.route('/', methods=["GET"])
def home():
    accesos=[]
    fecha_inicio = request.args.get("fecha_inicio") 
    fecha_fin = request.args.get("fecha_fin")

    try:
        conn = psycopg2.connect(
            database =os.getenv("DB_NAME"), 
            user = os.getenv("DB_USER"), 
            password= os.getenv("DB_PASSWORD"), 
            host = os.getenv("DB_HOST"), 
            port = os.getenv("DB_PORT")
        )
        cur = conn.cursor()
        if fecha_inicio and fecha_fin:
            cur.execute("SELECT nombre, correo, fecha, hora_entrada, hora_salida, motivo_ingreso, autorizante FROM acceso WHERE fecha BETWEEN %s AND %s ORDER BY fecha DESC", (fecha_inicio, fecha_fin))
        else:
            today = date.today()
            cur.execute("SELECT nombre, correo, fecha, hora_entrada, hora_salida, motivo_ingreso, autorizante FROM acceso WHERE fecha = %s ORDER BY fecha DESC", (today, ))

        accesos = cur.fetchall()
        print("resultados = ", accesos)
        cur.close()
        conn.close()
    except Exception as e:
        print("Error de conexion", {e})
        flash("Error de conexion", "alert") 
    
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
        # X
        if hora_entrada >= hora_salida:
            flash("La hora de entrada debe ser anterior a la hora de salida", "warning")
            return render_template('formulario.html',  hora_entrada=hora_entrada, hora_salida=hora_salida)

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
        flash(f"Error al procesar el acceso {e}" , "danger")
   
    return redirect("/")

#ruta para generar pdf de los registros
@app.route("/crear-reporte", methods = ["GET"])
def generar_reporte():
    try:
        conn = psycopg2.connect(
                database = os.getenv("DB_NAME"),
                user = os.getenv("DB_USER"),
                password = os.getenv("DB_PASSWORD"),
                host = os.getenv("DB_HOST"),
                port = os.getenv("DB_PORT")
        )
        cur = conn.cursor()
        cur.execute("select nombre, correo, fecha, hora_entrada, hora_salida, motivo_ingreso, autorizante from acceso")
        registro = cur.fetchall()
        cur.close()
        conn.close()
        #renderiza(?) el template html con los datos
        rendered_html = render_template("reporte.html", registro = registro)

        #configurar el whtmltopdf
        config = pdfkit.configuration(wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
        pdf = pdfkit.from_string(rendered_html, False, configuration=config)

        response = make_response(pdf)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = "inline; filename=registro_acceso.pdf"
        return response 
    except Exception as e:
        flash("Ocurrio un error al generar el reporte", "danger")
        return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)
