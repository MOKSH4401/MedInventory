export const addLog = async (logData) => {
    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };
  