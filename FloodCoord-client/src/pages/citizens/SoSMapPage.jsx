import React, { useState, useEffect } from 'react'
import { sosApi } from '../../api/sos.api'


export default function SoSMapPage() {
  const [sosList, setSosList] = useState([]);

  useEffect(() => {
    sosApi.getAll().then((res) => {
      setSosList(res.data);
    });
  }, []);

  return <div>SoS points: {sosList.length}</div>;
}
