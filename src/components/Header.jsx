import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="fixed" className="bg-primary">
      <Toolbar>
        <Typography variant="h6" component="div" className="flex-grow">
          Asistente Virtual
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
