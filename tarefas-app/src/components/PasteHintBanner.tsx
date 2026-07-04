import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

interface PasteHintBannerProps {
  onDismiss(): void;
}

export function PasteHintBanner({ onDismiss }: PasteHintBannerProps) {
  return (
    <Alert
      severity="success"
      className="no-print"
      sx={{ my: 2 }}
      action={
        <Button color="inherit" size="small" onClick={onDismiss}>
          Ok, entendi
        </Button>
      }
    >
      📋 Copiado! Cole (Ctrl+V) na aba correspondente da planilha para confirmar a tarefa.
    </Alert>
  );
}
