import storage from './utils/storage'
import MISPortal from './MISPortal'

// Inject storage into global window object for the ported code
window.storage = storage;

function App() {
  return (
    <MISPortal />
  )
}

export default App
