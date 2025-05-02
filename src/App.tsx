import './App.css'
import DynamicHorizontalStack from './components/DynamicStack'

function App() {
  const items = Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    content: <div style={{
      width: '100px',
      height: '100px',
      backgroundColor: 'blue',
      textAlign: 'center'
    }}>Item {i + 1}</div>
  }));
  return (
    <>
      <div style={{ width: '100vw', height: '100px', backgroundColor: 'red' }}>
        <DynamicHorizontalStack items={items} gap={8} />
      </div>

    </>
  )
}

export default App
