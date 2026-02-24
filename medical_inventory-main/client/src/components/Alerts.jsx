const Alerts = () => {
    const alerts = [
      { id: 1, message: "Paracetamol stock running low!", type: "warning" },
      { id: 2, message: "Ibuprofen batch expiring soon!", type: "danger" },
    ];
  
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Alerts</h2>
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id} className={`p-3 mb-2 rounded-lg ${alert.type === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
              {alert.message}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Alerts;
  