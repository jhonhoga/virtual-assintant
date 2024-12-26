import { Paper, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Paper component="footer" square className="fixed bottom-0 w-full py-4 bg-primary text-white">
      <Typography variant="body2" align="center">
        © {new Date().getFullYear()} Asistente Virtual. Todos los derechos reservados.
      </Typography>
    </Paper>
  );
};

export default Footer;
