import { Button } from '@sugartown/design-system';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sugartown Web App</h1>
      <p>A composable MACH reference architecture.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Button onClick={() => alert('Design system working!')}>
          Click Me
        </Button>
      </div>
    </div>
  );
}

export default App;
