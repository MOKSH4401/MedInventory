const DashboardCard = ({ title, value, icon: Icon, className }) => (
    <div className={`p-6 shadow-md rounded-lg ${className}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-100">
          <Icon className="h-6 w-6 text-blue-700" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
  
  export default DashboardCard;
  