import { useEffect, useState } from "react";
import { getLogs } from "../api/logsApi";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      setLogs(await getLogs());
    }
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      <ul>
        {logs.map(log => (
          <li key={log.id}>{log.action} - {log.itemId} - {log.timestamp}</li>
        ))}
      </ul>
    </div>
  );
};

export default AuditLogs;
