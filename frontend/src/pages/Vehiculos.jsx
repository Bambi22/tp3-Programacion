import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const VACIO = { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' };

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  const cargar = async () => {
    try {
      setVehiculos(await api('/vehiculos'));
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
    const anioActual = new Date().getFullYear();
    if (!form.marca.trim()) er.marca = 'La marca es obligatoria';
    if (!form.modelo.trim()) er.modelo = 'El modelo es obligatorio';
    if (!form.patente.trim()) er.patente = 'La patente es obligatoria';
    const anio = Number(form.anio);
    if (!form.anio || !Number.isInteger(anio) || anio < 1900 || anio > anioActual + 1) {
      er.anio = `Año entre 1900 y ${anioActual + 1}`;
    }
    const cap = Number(form.capacidad_carga);
    if (form.capacidad_carga === '' || Number.isNaN(cap) || cap <= 0) {
      er.capacidad_carga = 'Debe ser un número mayor a 0';
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
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: form.patente.trim().toUpperCase(),
      anio: Number(form.anio),
      capacidad_carga: Number(form.capacidad_carga),
    };
    try {
      if (editandoId) {
        await api(`/vehiculos/${editandoId}`, { method: 'PUT', body });
        setOk('Vehículo modificado');
      } else {
        await api('/vehiculos', { method: 'POST', body });
        setOk('Vehículo creado');
      }
      limpiar();
      cargar();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const editar = (v) => {
    setEditandoId(v.id);
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: String(v.anio),
      capacidad_carga: String(v.capacidad_carga),
    });
    setErrores({});
    setMsg('');
    setOk('');
  };

  const eliminar = async (v) => {
    if (!window.confirm(`¿Eliminar el vehículo ${v.patente}?`)) return;
    setMsg('');
    setOk('');
    try {
      await api(`/vehiculos/${v.id}`, { method: 'DELETE' });
      setOk('Vehículo eliminado');
      if (editandoId === v.id) limpiar();
      cargar();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <section>
      <h1>Vehículos</h1>

      <form className="panel" onSubmit={enviar} noValidate>
        <h2>{editandoId ? 'Modificar vehículo' : 'Nuevo vehículo'}</h2>
        {msg && <p className="error">{msg}</p>}
        {ok && <p className="ok">{ok}</p>}

        <div className="form-grid">
          <label>Marca
            <input name="marca" value={form.marca} onChange={cambiar} />
            {errores.marca && <small className="error">{errores.marca}</small>}
          </label>
          <label>Modelo
            <input name="modelo" value={form.modelo} onChange={cambiar} />
            {errores.modelo && <small className="error">{errores.modelo}</small>}
          </label>
          <label>Patente
            <input name="patente" value={form.patente} onChange={cambiar} />
            {errores.patente && <small className="error">{errores.patente}</small>}
          </label>
          <label>Año
            <input name="anio" type="number" value={form.anio} onChange={cambiar} />
            {errores.anio && <small className="error">{errores.anio}</small>}
          </label>
          <label>Capacidad de carga (kg)
            <input name="capacidad_carga" type="number" value={form.capacidad_carga} onChange={cambiar} />
            {errores.capacidad_carga && <small className="error">{errores.capacidad_carga}</small>}
          </label>
        </div>

        <div className="acciones" style={{ marginTop: '1rem' }}>
          <button className="btn">{editandoId ? 'Guardar cambios' : 'Crear vehículo'}</button>
          {editandoId && (
            <button type="button" className="btn btn-secundario" onClick={limpiar}>Cancelar</button>
          )}
        </div>
      </form>

      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Patente</th>
              <th>Año</th>
              <th>Capacidad (kg)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.length === 0 && (
              <tr><td colSpan="6">No hay vehículos cargados</td></tr>
            )}
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.patente}</td>
                <td>{v.anio}</td>
                <td>{v.capacidad_carga}</td>
                <td>
                  <div className="acciones">
                    <button className="btn" onClick={() => editar(v)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => eliminar(v)}>Eliminar</button>
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