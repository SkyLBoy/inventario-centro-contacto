import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import reportData from '../../data/reports.json';

const ReportsPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    usuario: '',
    categoria: '',
    persona: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    setFilteredReports(reportData);
  }, []);

  const handleFilter = () => {
    const results = reportData.filter((item) => {
      const matchUsuario = filters.usuario
        ? item.usuario.toLowerCase().includes(filters.usuario.toLowerCase())
        : true;
      const matchCategoria = filters.categoria
        ? item.categoria.toLowerCase().includes(filters.categoria.toLowerCase())
        : true;
      const matchPersona = filters.persona
        ? item.persona.toLowerCase().includes(filters.persona.toLowerCase())
        : true;

      const fecha = new Date(item.fecha);
      const desde = filters.fechaInicio ? new Date(filters.fechaInicio) : null;
      const hasta = filters.fechaFin ? new Date(filters.fechaFin) : null;

      const matchFecha =
        (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

      return matchUsuario && matchCategoria && matchPersona && matchFecha;
    });

    setFilteredReports(results);
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Reportes y Estadísticas</h1>

        <div className="text-gray-600 mb-6">
          <Input
            label="Usuario"
            value={filters.usuario}
            onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
          />
          <Input
            label="Categoría"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          />
          <Input
            label="Persona"
            value={filters.persona}
            onChange={(e) => setFilters({ ...filters, persona: e.target.value })}
          />
          <Input
            type="date"
            label="Desde"
            value={filters.fechaInicio}
            onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
          />
          <Input
            type="date"
            label="Hasta"
            value={filters.fechaFin}
            onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={handleFilter}>🔍 Aplicar filtros</Button>
        </div>
        
        <div className="text-2xl font-bold text-gray-800 mb-6 flex justify-end mb-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>⬅️ Volver</Button>
        </div>

        {filteredReports.length === 0 ? (
        <div className="text-gray-500 italic">No se encontraron resultados.</div>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3 text-left border-b">Fecha</th>
                <th className="p-3 text-left border-b">Usuario</th>
                <th className="p-3 text-left border-b">Categoría</th>
                <th className="p-3 text-left border-b">Persona</th>
                <th className="p-3 text-left border-b">Producto</th>
                <th className="p-3 text-left border-b">Detalles</th>
              </tr>
            </thead>
            <tbody className="text-black-800 text-gray-800 mb-6">
              {filteredReports.map((r, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{r.fecha}</td>
                  <td className="p-3 border-b">{r.usuario}</td>
                  <td className="p-3 border-b">{r.categoria}</td>
                  <td className="p-3 border-b">{r.persona}</td>
                  <td className="p-3 border-b">
                                              {Array.isArray(r.detalle)
                                                ? r.detalle.map((d, i) => <div key={i}>{d}</div>)
                                                : r.detalle}
                                            </td>
                  <td className="p-3 border-b">
                    <Button size="sm" variant="outline" onClick={() => alert(JSON.stringify(r, null, 2))}>
                      Ver detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReportsPage;
