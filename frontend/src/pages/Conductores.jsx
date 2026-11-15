import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const VACIO = {
  nombre: '',
  apellido: '',
  numero_documento: '',
  numero_licencia: '',
  fecha_alta_licencia: '',
  fecha_vencimiento_licencia: '',
};

// El backend puede devolver fechas como "2024-01-01T00:00:00.000Z": nos quedamos con YYYY-MM-DD
const soloFecha = (f) => (f ? String(f).slice(0, 10) : '');

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  const cargar = async () => {
    try {
      setConductores(await api('/conductores'));
    } catch (err) {
      setMsg(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const er = {};
    if (!form.nombre.trim()) er.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) er.apellido = 'El apellido es obligatorio';
    if (!/^\d{6,10}$/.test(form.numero_documento.trim())) {
      er.numero_documento = 'Solo números, entre 6 y 10 dígitos';
    }
    if (!form.numero_licencia.trim()) er.numero_licencia = 'El número de licencia es obligatorio';
    if (!form.fecha_alta_licencia) er.fecha_alta_licencia = 'La fecha de alta es obligatoria';
    if (!form.fecha_vencimiento_licencia) {
      er.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria';
    } else if (
      form.fecha_alta_licencia &&
      form.fecha_vencimiento_licencia <= form.fecha_alta_licencia
    ) {
      er.fecha_vencimiento_licencia = 'Debe ser posterior a la fecha de alta';
    }
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const limpiar = () => {
    setForm(VACIO);
    setEditandoId(null);
    setErrores({});
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMsg('');
    setOk('');
    if (!validar()) return;
    const body = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      numero_documento: form.numero_documento.trim(),
      numero_licencia: form.numero_licencia.trim(),
      fecha_alta_licencia: form.fecha_alta_licencia,
      fecha_vencimiento_licencia: form.fecha_vencimiento_licencia,
    };
    try {
      if (editandoId) {
        await api(`/conductores/${editandoId}`, { method: 'PUT', body });
        setOk('Conductor modificado');
      } else {
        await api('/conductores', { method: 'POST', body });
        setOk('Conductor creado');
      }
      limpiar();
      cargar();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const editar = (c) => {
    setEditandoId(c.id);
    setForm({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: String(c.numero_documento),
      numero_licencia: c.numero_licencia,
      fecha_alta_licencia: soloFecha(c.fecha_alta_licencia),
      fecha_vencimiento_licencia: soloFecha(c.fecha_vencimiento_licencia),
    });
    setErrores({});
    setMsg('');
    setOk('');
  };

  const eliminar = async (c) => {
    if (!window.confirm(`¿Eliminar al conductor ${c.nombre} ${c.apellido}?`)) return;
    setMsg('');
    setOk('');
    try {
      await api(`/conductores/${c.id}`, { method: 'DELETE' });
      setOk('Conductor eliminado');
      if (editandoId === c.id) limpiar();
      cargar();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <section>
      <h1>Conductores</h1>

      <form className="panel" onSubmit={enviar} noValidate>
        <h2>{editandoId ? 'Modificar conductor' : 'Nuevo conductor'}</h2>
        {msg && <p className="error">{msg}</p>}
        {ok && <p className="ok">{ok}</p>}

        <div className="form-grid">
          <label>Nombre
            <input name="nombre" value={form.nombre} onChange={cambiar} />
            {errores.nombre && <small className="error">{errores.nombre}</small>}
          </label>
          <label>Apellido
            <input name="apellido" value={form.apellido} onChange={cambiar} />
            {errores.apellido && <small className="error">{errores.apellido}</small>}
          </label>
          <label>Número de documento
            <input name="numero_documento" value={form.numero_documento} onChange={cambiar} />
            {errores.numero_documento && <small className="error">{errores.numero_documento}</small>}
          </label>
          <label>Número de licencia
            <input name="numero_licencia" value={form.numero_licencia} onChange={cambiar} />
            {errores.numero_licencia && <small className="error">{errores.numero_licencia}</small>}
          </label>
          <label>Alta de licencia
            <input name="fecha_alta_licencia" type="date" value={form.fecha_alta_licencia} onChange={cambiar} />
            {errores.fecha_alta_licencia && <small className="error">{errores.fecha_alta_licencia}</small>}
          </label>
          <label>Vencimiento de licencia
            <input name="fecha_vencimiento_licencia" type="date" value={form.fecha_vencimiento_licencia} onChange={cambiar} />
            {errores.fecha_vencimiento_licencia && <small className="error">{errores.fecha_vencimiento_licencia}</small>}
          </label>
        </div>

        <div className="acciones" style={{ marginTop: '1rem' }}>
          <button className="btn">{editandoId ? 'Guardar cambios' : 'Crear conductor'}</button>
          {editandoId && (
            <button type="button" className="btn btn-secundario" onClick={limpiar}>Cancelar</button>
          )}
        </div>
      </form>

      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Documento</th>
              <th>Licencia</th>
              <th>Alta</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductores.length === 0 && (
              <tr><td colSpan="7">No hay conductores cargados</td></tr>
            )}
            {conductores.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.numero_documento}</td>
                <td>{c.numero_licencia}</td>
                <td>{soloFecha(c.fecha_alta_licencia)}</td>
                <td>{soloFecha(c.fecha_vencimiento_licencia)}</td>
                <td>
                  <div className="acciones">
                    <button className="btn" onClick={() => editar(c)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => eliminar(c)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}