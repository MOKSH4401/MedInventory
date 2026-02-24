import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer} from 'react-toastify';
import { ItemProvider } from "./store/itemStore.jsx"; 
import { SettingsProvider } from "./store/SettingsStore";

createRoot(document.getElementById('root')).render(
  <SettingsProvider>

  <ItemProvider>
    <App />
    <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="toastBody"
      />
   </ItemProvider>
  </SettingsProvider>


)
