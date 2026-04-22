import { Button, Container, Paper, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg" className="py-8">
      <Paper elevation={3} className="p-6">
        <Typography variant="h4" component="h1" gutterBottom className="!font-bold">
          Welcome to My Recipe Nest & ChefPortal
        </Typography>
      </Paper>
    </Container>
  );
}

export default App;