from flask import Flask, request, redirect, render_template, url_for, flash, make_response, session
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

# Ruta principal: mensaje de bienvenida
@app.route("/")
def inicio():
    return render_template("inicio.html")

@app.route("/paso1", methods=["GET", "POST"])
def paso1():
    if request.method == "POST":
        # Procesar firma del visitante
        firmavisitante_data = request.form["firmavisitante"]
        if "," in firmavisitante_data:
            header, encoded = firmavisitante_data.split(",", 1)
            image_data = base64.b64decode(encoded)

            now = datetime.now()
            fecha = now.strftime("%Y-%m-%d")
            mes = now.strftime("%m")
            nombre = request.form.get("name", "visitante").replace(" ", "_").lower()

            # Crear subcarpeta por mes si no existe
            subcarpeta = os.path.join(app.config['UPLOAD_FOLDER'], "visitantes", mes)
            os.makedirs(subcarpeta, exist_ok=True)

            # Crear nombre del archivo
            filename = f"{fecha}_{nombre}_visitante.png"
            path_firma = os.path.join(subcarpeta, filename)

            # Guardar imagen
            with open(path_firma, "wb") as f:
                f.write(image_data)
        else:
            flash("Firma del visitante inválida", "danger")
            return redirect(url_for("paso1"))

        # Guardar en sesión solo texto + ruta de imagen
        session["paso1"] = {
            "name": request.form["name"],
            "email": request.form["email"],
            "hora_entrada": request.form.get("hora_entrada"),
            "fechaFirma": request.form.get("fechaFirma"),
            "firma_path": path_firma
        }
        session.permanent = True  # para mantener sesión viva
        return redirect(url_for("paso2"))

    return render_template("registro_visitante.html")

@app.route("/paso2", methods=["GET", "POST"])
def paso2():
    if "paso1" not in session:
        flash("Primero completa el paso 1", "warning")
        return redirect(url_for("paso1"))

    if request.method == "POST":
        firmaautorizacion_data = request.form["firmaautorizacion"]
        if "," in firmaautorizacion_data:
            header, encoded = firmaautorizacion_data.split(",", 1)
            image_data = base64.b64decode(encoded)

            now = datetime.now()
            fecha = now.strftime("%Y-%m-%d")
            mes = now.strftime("%m")
            autorizante = request.form.get("autorizante", "autorizante").replace(" ", "_").lower()

            # Crear subcarpeta
            subcarpeta = os.path.join(app.config['UPLOAD_FOLDER'], "autorizantes", mes)
            os.makedirs(subcarpeta, exist_ok=True)

            # Crear nombre del archivo
            filename = f"{fecha}_{autorizante}_autorizante.png"
            path_firma_autorizante = os.path.join(subcarpeta, filename)

            # Guardar imagen
            with open(path_firma_autorizante, "wb") as f:
                f.write(image_data)
        else:
            flash("Firma del autorizante inválida", "danger")
            return redirect(url_for("paso2"))

        session["paso2"] = {
            "autorizante": request.form["autorizante"],
            "motivo": request.form["motivo"],
            "hora_salida": request.form.get("hora_salida"),
            "observacion": request.form.get("observacion", ""),
            "firma_path": path_firma_autorizante
        }

        return redirect(url_for("crear_acceso"))

    return render_template("registro_autorizante.html")


@app.route("/crear-acceso", methods=["GET", "POST"])
def crear_acceso():
    paso1 = session.get("paso1")
    paso2 = session.get("paso2")

    if not paso1 or not paso2:
        flash("Error al cargar datos en el formulario", "danger")
        return redirect(url_for("paso1"))

    try:
        name = paso1["name"]
        email = paso1["email"]
        hora_entrada = paso1["hora_entrada"]
        fecha = paso1["fechaFirma"] 
        firma_visitante = paso1["firma_path"]
        motivo = paso2["motivo"]
        autorizante = paso2["autorizante"]
        hora_salida = paso2["hora_salida"]

        observacion = paso2["observacion"]
        firma_autorizante = paso2["firma_path"]

        # Guardar en DB
        conn = psycopg2.connect(
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO acceso (
                nombre, correo, fecha, hora_entrada,
                hora_salida, motivo_ingreso, firma_visitante, autorizante, firma_autorizante, observacion
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            name, email, fecha, hora_entrada, hora_salida, motivo, firma_visitante, autorizante, firma_autorizante, observacion
        ))
        conn.commit()
        cur.close()
        conn.close()

        # Limpiar sesión
        session.pop("paso1", None)
        session.pop("paso2", None)

        flash("Acceso guardado correctamente", "success")
        return redirect(url_for("mostrar_registro"))

    except Exception as e:
        flash(f"Error al procesar el acceso: {e}", "danger")
        return redirect(url_for("paso1"))

# Mostrar formulario
@app.route('/mostrar-registro', methods=["GET"])
def mostrar_registro():
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
            fecha_inicio = fecha_fin =  today.strftime("%Y-%m-%d")  # para usar en el botón de reporte

        accesos = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        flash("Error de conexion", "alert") 
    return render_template("mostrar_registro.html", accesos=accesos, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)

#ruta para generar pdf de los registros
@app.route("/crear-reporte", methods = ["GET"])
def generar_reporte():
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    print(fecha_inicio, fecha_fin)
    try:
        conn = psycopg2.connect(
                database = os.getenv("DB_NAME"),
                user = os.getenv("DB_USER"),
                password = os.getenv("DB_PASSWORD"),
                host = os.getenv("DB_HOST"),
                port = os.getenv("DB_PORT")
        )
        cur = conn.cursor()
        if fecha_inicio and fecha_fin:
            cur.execute("""
                SELECT nombre, correo, fecha, hora_entrada, hora_salida, motivo_ingreso, autorizante 
                FROM acceso 
                WHERE fecha BETWEEN %s AND %s
                ORDER BY fecha DESC
            """, (fecha_inicio, fecha_fin))
        else:
            cur.execute("""
                SELECT nombre, correo, fecha, hora_entrada, hora_salida, motivo_ingreso, autorizante 
                FROM acceso 
                ORDER BY fecha DESC
            """)
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
