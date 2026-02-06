import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565C0",
      light: "#1976D2",
      dark: "#0D47A1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#455A64",
      light: "#607D8B",
      dark: "#37474F",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    warning: {
      main: "#ED6C02",
      light: "#FF9800",
      dark: "#E65100",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#C62828",
    },
    info: {
      main: "#0288D1",
      light: "#03A9F4",
      dark: "#01579B",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A2027",
      secondary: "#5A6A7A",
    },
    divider: "#E0E6ED",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.08)",
    "0px 2px 6px rgba(0, 0, 0, 0.08)",
    "0px 4px 12px rgba(0, 0, 0, 0.1)",
    "0px 6px 16px rgba(0, 0, 0, 0.1)",
    "0px 8px 24px rgba(0, 0, 0, 0.12)",
    "0px 12px 32px rgba(0, 0, 0, 0.12)",
    "0px 16px 40px rgba(0, 0, 0, 0.14)",
    "0px 20px 48px rgba(0, 0, 0, 0.14)",
    "0px 24px 56px rgba(0, 0, 0, 0.16)",
    "0px 28px 64px rgba(0, 0, 0, 0.16)",
    "0px 32px 72px rgba(0, 0, 0, 0.18)",
    "0px 36px 80px rgba(0, 0, 0, 0.18)",
    "0px 40px 88px rgba(0, 0, 0, 0.2)",
    "0px 44px 96px rgba(0, 0, 0, 0.2)",
    "0px 48px 104px rgba(0, 0, 0, 0.22)",
    "0px 52px 112px rgba(0, 0, 0, 0.22)",
    "0px 56px 120px rgba(0, 0, 0, 0.24)",
    "0px 60px 128px rgba(0, 0, 0, 0.24)",
    "0px 64px 136px rgba(0, 0, 0, 0.26)",
    "0px 68px 144px rgba(0, 0, 0, 0.26)",
    "0px 72px 152px rgba(0, 0, 0, 0.28)",
    "0px 76px 160px rgba(0, 0, 0, 0.28)",
    "0px 80px 168px rgba(0, 0, 0, 0.3)",
    "0px 84px 176px rgba(0, 0, 0, 0.3)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: "0.9375rem",
        },
        contained: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5F7FA",
          "& .MuiTableCell-head": {
            fontWeight: 600,
            color: "#1A2027",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9375rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.08)",
        },
      },
    },
  },
});

export default theme;
