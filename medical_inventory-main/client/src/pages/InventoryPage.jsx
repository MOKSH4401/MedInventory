import ExpiredItems from "../components/ExpiredItems";
import InventoryTable from "../components/InventoryTable";

const InventoryPage = () => {
  
  return (
    <div className="p-6">
      <div>

      <div className="text-3xl font-bold mb-4 text-black dark:text-white">Inventory</div>
      <InventoryTable />
      </div>
      <div className="mt-12">
      <ExpiredItems/>
      </div>

    </div>
  );
};

export default InventoryPage;
