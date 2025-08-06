import { useState, useMemo } from 'react';

const useSearch = (data, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    return data.filter(item =>
      searchFields.some(field =>
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchFields]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm
  };
};

export default useSearch;
