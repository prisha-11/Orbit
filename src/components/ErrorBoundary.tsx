import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Orbit Error Boundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('orbit_opportunities');
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center', mt: 8 }}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'error.main' }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                A temporary rendering issue occurred. You can reload the page or reset the local demo data.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
                <Button variant="outlined" color="error" startIcon={<RestartAltIcon />} onClick={this.handleReset}>
                  Reset Demo Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
