import React, { useState, useEffect, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Extraer categorías únicas para el dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(reportData.map(item => item.categoria))];
    return categories.sort();
  }, []);

  // Extraer usuarios únicos para el dropdown
  const uniqueUsers = useMemo(() => {
    const users = [...new Set(reportData.map(item => item.usuario))];
    return users.sort();
  }, []);

  // Extraer personas únicas para el dropdown
  const uniquePersons = useMemo(() => {
    const persons = [...new Set(reportData.map(item => item.persona))];
    return persons.sort();
  }, []);

  useEffect(() => {
    setFilteredReports(reportData);
  }, []);

  const handleFilter = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const results = reportData.filter((item) => {
        const matchUsuario = filters.usuario
          ? item.usuario.toLowerCase().includes(filters.usuario.toLowerCase())
          : true;
        const matchCategoria = filters.categoria
          ? item.categoria.toLowerCase() === filters.categoria.toLowerCase()
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
      setIsLoading(false);
    }, 500);
  };

  const handleClearFilters = () => {
    setFilters({
      usuario: '',
      categoria: '',
      persona: '',
      fechaInicio: '',
      fechaFin: '',
    });
    setFilteredReports(reportData);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedReports = [...filteredReports].sort((a, b) => {
      if (key === 'fecha') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      const aValue = a[key]?.toString().toLowerCase() || '';
      const bValue = b[key]?.toString().toLowerCase() || '';
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReports(sortedReports);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Usuario', 'Categoría', 'Persona', 'Producto'];
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(row => [
        row.fecha,
        row.usuario,
        row.categoria,
        row.persona,
        Array.isArray(row.detalle) ? row.detalle.join(';') : row.detalle
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 Reportes y Estadísticas
              </h1>
              <p className="text-gray-600">
                Gestiona y analiza los reportes del sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                ⬅️ Volver
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Filtros de búsqueda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Dropdown de Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <select
                value={filters.usuario}
                onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los usuarios</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Dropdown de Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Dropdown de Persona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Persona</label>
              <select
                value={filters.persona}
                onChange={(e) => setFilters({ ...filters, persona: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las personas</option>
                {uniquePersons.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <Input
                type="date"
                label="Fecha desde"
                value={filters.fechaInicio}
                onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <Input
                type="date"
                label="Fecha hasta"
                value={filters.fechaFin}
                onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleFilter} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? '⏳' : '🔍'} {isLoading ? 'Buscando...' : 'Aplicar filtros'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              🧹 Limpiar filtros
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              disabled={filteredReports.length === 0}
              className="flex items-center gap-2"
            >
              📊 Exportar CSV
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{filteredReports.length}</div>
            <div className="text-sm text-gray-600">Total reportes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {new Set(filteredReports.map(r => r.usuario)).size}
            </div>
            <div className="text-sm text-gray-600">Usuarios únicos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(filteredReports.map(r => r.categoria)).size}
            </div>
            <div className="text-sm text-gray-600">Categorías</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredReports.map(r => r.persona)).size}
            </div>
            <div className="text-sm text-gray-600">Personas únicas</div>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Resultados ({filteredReports.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando resultados...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'fecha', label: 'Fecha' },
                      { key: 'usuario', label: 'Usuario' },
                      { key: 'categoria', label: 'Categoría' },
                      { key: 'persona', label: 'Persona' },
                      { key: 'detalle', label: 'Producto' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-2">
                          {label}
                          <span className="text-gray-400">{getSortIcon(key)}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">
                              {report.usuario.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {report.usuario}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {report.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.persona}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {Array.isArray(report.detalle) ? (
                          <div className="space-y-1">
                            {report.detalle.slice(0, 2).map((detail, i) => (
                              <div key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {detail}
                              </div>
                            ))}
                            {report.detalle.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{report.detalle.length - 2} más
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {report.detalle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Crear modal más elegante
                            const modalContent = `
                              <div style="font-family: Arial, sans-serif;">
                                <h3 style="color: #1f2937; margin-bottom: 16px;">📋 Detalles del Reporte</h3>
                                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                  <p><strong>Fecha:</strong> ${new Date(report.fecha).toLocaleDateString('es-ES')}</p>
                                  <p><strong>Usuario:</strong> ${report.usuario}</p>
                                  <p><strong>Categoría:</strong> ${report.categoria}</p>
                                  <p><strong>Persona:</strong> ${report.persona}</p>
                                </div>
                                <div>
                                  <p style="font-weight: bold; margin-bottom: 8px;">Producto/Detalles:</p>
                                  <div style="background: white; padding: 12px; border: 1px solid #e5e7eb; border-radius: 4px;">
                                    ${Array.isArray(report.detalle) 
                                      ? report.detalle.map(d => `<p style="margin: 4px 0;">• ${d}</p>`).join('') 
                                      : `<p>${report.detalle}</p>`}
                                  </div>
                                </div>
                              </div>
                            `;
                            
                            // Crear ventana emergente más elegante
                            const newWindow = window.open('', '_blank', 'width=600,height=400');
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Detalles del Reporte</title>
                                  <style>
                                    body { margin: 20px; font-family: Arial, sans-serif; }
                                  </style>
                                </head>
                                <body>
                                  ${modalContent}
                                  <div style="margin-top: 20px; text-align: right;">
                                    <button onclick="window.close()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
                                  </div>
                                </body>
                              </html>
                            `);
                          }}
                          className="flex items-center gap-1"
                        >
                          👁️ Ver
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
    </div>
  );
};

export default ReportsPage;