import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const VACIO = {
  vehiculo_id: '',
  conductor_id: '',
  fecha_salida: '',
  fecha_llegada: '',
  origen: '',
  destino: '',
  kilometros: '',
  observaciones: '',
};

// Muestra "YYYY-MM-DD HH:mm" a partir de lo que devuelva el backend
const formatearFecha = (f) => (f ? String(f).replace('T', ' ').slice(0, 16) : '');

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  // Filtros del historial
  const [filtroTipo, setFiltroTipo] = useState('vehiculo');
  const [filtroId, setFiltroId] = useState('');
  const [totalKm, setTotalKm] = useState(null);

  const cargarViajes = async (tipo = filtroTipo, id = filtroId) => {
    try {
      const query = id ? `?${tipo}_id=${id}` : '';
      setViajes(await api(`/viajes${query}`));
    } catch (err) {
      setMsg(err.message);
    }
  };

  useEffect(() => {
    const iniciar = async () => {
      try {
        setVehiculos(await api('/vehiculos'));
        setConductores(await api('/conductores'));
      } catch (err) {
        setMsg(err.message);
      }
      cargarViajes('vehiculo', '');
    };
    iniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const er = {};
    if (!form.vehiculo_id) er.vehiculo_id = 'Elegí un vehículo';
    if (!form.conductor_id) er.conductor_id = 'Elegí un conductor';
    if (!form.fecha_salida) er.fecha_salida = 'La fecha de salida es obligatoria';
    if (!form.fecha_llegada) {
      er.fecha_llegada = 'La fecha de llegada es obligatoria';
    } else if (form.fecha_salida && form.fecha_llegada < form.fecha_salida) {
      er.fecha_llegada = 'No puede ser anterior a la salida';
    }
    if (!form.origen.trim()) er.origen = 'El origen es obligatorio';
    if (!form.destino.trim()) er.destino = 'El destino es obligatorio';
    const km = Number(form.kilometros);
    if (form.kilometros === '' || Number.isNaN(km) || km <= 0) {
      er.kilometros = 'Debe ser un número mayor a 0';
    }
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMsg('');
    setOk('');
    if (!validar()) return;
    const body = {
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      fecha_salida: form.fecha_salida,
      fecha_llegada: form.fecha_llegada,
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      kilometros: Number(form.kilometros),
      observaciones: form.observaciones.trim() || undefined,
    };
    try {
      await api('/viajes', { method: 'POST', body });
      setOk('Viaje registrado');
      setForm(VACIO);
      setErrores({});
      cargarViajes();
      setTotalKm(null);
    } catch (err) {
      // Incluye el 403 por licencia vencida
      setMsg(err.message);
    }
  };

  const eliminar = async (v) => {
    if (!window.confirm('¿Eliminar este viaje?')) return;
    setMsg('');
    setOk('');
    try {
      await api(`/viajes/${v.id}`, { method: 'DELETE' });
      setOk('Viaje eliminado');
      cargarViajes();
      setTotalKm(null);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const aplicarFiltro = () => {
    setMsg('');
    setOk('');
    setTotalKm(null);
    cargarViajes(filtroTipo, filtroId);
  };

  const limpiarFiltro = () => {
    setFiltroId('');
    setTotalKm(null);
    setMsg('');
    cargarViajes(filtroTipo, '');
  };

  const calcularKm = async () => {
    setMsg('');
    if (!filtroId) {
      setMsg(`Elegí un ${filtroTipo} para calcular los kilómetros`);
      return;
    }
    try {
      const data = await api(`/viajes/km?${filtroTipo}_id=${filtroId}`);
      setTotalKm(data.total_km);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const nombreVehiculo = (id) => {
    const v = vehiculos.find((x) => x.id === id);
    return v ? `${v.marca} ${v.modelo} (${v.patente})` : `#${id}`;
  };

  const nombreConductor = (id) => {
    const c = conductores.find((x) => x.id === id);
    return c ? `${c.nombre} ${c.apellido}` : `#${id}`;
  };

  const opcionesFiltro = filtroTipo === 'vehiculo' ? vehiculos : conductores;

  return (
    <section>
      <h1>Viajes</h1>

      <form className="panel" onSubmit={enviar} noValidate>
        <h2>Registrar viaje</h2>
        {msg && <p className="error">{msg}</p>}
        {ok && <p className="ok">{ok}</p>}

        <div className="form-grid">
          <label>Vehículo
            <select name="vehiculo_id" value={form.vehiculo_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</option>
              ))}
            </select>
            {errores.vehiculo_id && <small className="error">{errores.vehiculo_id}</small>}
          </label>
          <label>Conductor
            <select name="conductor_id" value={form.conductor_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
              ))}
            </select>
            {errores.conductor_id && <small className="error">{errores.conductor_id}</small>}
          </label>
          <label>Fecha de salida
            <input name="fecha_salida" type="datetime-local" value={form.fecha_salida} onChange={cambiar} />
            {errores.fecha_salida && <small className="error">{errores.fecha_salida}</small>}
          </label>
          <label>Fecha de llegada
            <input name="fecha_llegada" type="datetime-local" value={form.fecha_llegada} onChange={cambiar} />
            {errores.fecha_llegada && <small className="error">{errores.fecha_llegada}</small>}
          </label>
          <label>Origen
            <input name="origen" value={form.origen} onChange={cambiar} />
            {errores.origen && <small className="error">{errores.origen}</small>}
          </label>
          <label>Destino
            <input name="destino" value={form.destino} onChange={cambiar} />
            {errores.destino && <small className="error">{errores.destino}</small>}
          </label>
          <label>Kilómetros
            <input name="kilometros" type="number" value={form.kilometros} onChange={cambiar} />
            {errores.kilometros && <small className="error">{errores.kilometros}</small>}
          </label>
          <label>Observaciones (opcional)
            <input name="observaciones" value={form.observaciones} onChange={cambiar} />
          </label>
        </div>

        <div className="acciones" style={{ marginTop: '1rem' }}>
          <button className="btn">Registrar viaje</button>
        </div>
      </form>

      <div className="panel">
        <h2>Historial</h2>
        <div className="form-grid">
          <label>Consultar por
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setFiltroId('');
                setTotalKm(null);
              }}
            >
              <option value="vehiculo">Vehículo</option>
              <option value="conductor">Conductor</option>
            </select>
          </label>
          <label>{filtroTipo === 'vehiculo' ? 'Vehículo' : 'Conductor'}
            <select value={filtroId} onChange={(e) => { setFiltroId(e.target.value); setTotalKm(null); }}>
              <option value="">Todos</option>
              {opcionesFiltro.map((o) => (
                <option key={o.id} value={o.id}>
                  {filtroTipo === 'vehiculo' ? `${o.marca} ${o.modelo} (${o.patente})` : `${o.nombre} ${o.apellido}`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="acciones" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn" onClick={aplicarFiltro}>Filtrar</button>
          <button type="button" className="btn btn-secundario" onClick={limpiarFiltro}>Ver todos</button>
          <button type="button" className="btn" onClick={calcularKm}>Calcular km totales</button>
        </div>
        {totalKm !== null && <p className="ok">Total de kilómetros: {totalKm} km</p>}
      </div>

      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Km</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {viajes.length === 0 && (
              <tr><td colSpan="9">No hay viajes para mostrar</td></tr>
            )}
            {viajes.map((v) => (
              <tr key={v.id}>
                <td>{nombreVehiculo(v.vehiculo_id)}</td>
                <td>{nombreConductor(v.conductor_id)}</td>
                <td>{formatearFecha(v.fecha_salida)}</td>
                <td>{formatearFecha(v.fecha_llegada)}</td>
                <td>{v.origen}</td>
                <td>{v.destino}</td>
                <td>{v.kilometros}</td>
                <td>{v.observaciones}</td>
                <td>
                  <div className="acciones">
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