import * as React from "react";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Sitemark from "./SitemarkIcon";
import ColorModeIconDropdown from ".././theme/ColorModeIconDropdown";
import Popover from "@mui/material/Popover";
import data from "../assets/data.json";
import { Link, NavLink, Route, Routes } from "react-router";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container>
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              pl: 0,
            }}
          >
            <Button href="/" sx={{ mx: 3, maxWidth: 60 }}>
              <Sitemark />
            </Button>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                justifyContent: { xs: "none", sm: "space-evenly" },
                minWidth: 1,
                pr: "40%",
              }}
            >
              {data.menu.map((menuItem, index) => (
                <Button
                  variant="text"
                  color="info"
                  href={menuItem.url}
                  key={index}
                  sx={{ minWidth: 0, }}
                >
                  {menuItem.title}
                </Button>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <ColorModeIconDropdown />
          </Box>
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton
              aria-label="Menu button"
              onClick={handleClick}
              aria-describedby={id}
            >
              <MenuIcon />
            </IconButton>
            <Popover
              open={open}
              id={id}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                {data.menu.map((menuItem, index) => (
                  <MenuItem key={index}>
                    <Button
                      variant="text"
                      color="info"
                      size="small"
                      href={menuItem.url}
                      key={index}
                      sx={{ minWidth: 0 }}
                    >
                      {menuItem.title}
                    </Button>
                  </MenuItem>
                ))}
              </Box>
            </Popover>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
