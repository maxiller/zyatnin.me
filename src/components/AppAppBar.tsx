import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import Sitemark from './SitemarkIcon';
import { menuItems, MenuItem as MenuItemType } from '../data';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: 0, // Убираем скругления для "терминального" вида
    border: '1px solid #00ff00',
    backgroundColor: '#000000',
    padding: '8px 12px',
}));

const AppAppBar: React.FC = () => {
    const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

    const handleDrawerToggle = (): void => {
        setMobileOpen((prev) => !prev);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2, bgcolor: '#000000' }}>
            {menuItems.map((item: MenuItemType, index: number) => (
                <MenuItem key={index}>
                    <Button variant="text" color="info" href={item.url} sx={{ width: '100%', color: '#00ff00' }}>
                        {item.title}
                    </Button>
                </MenuItem>
            ))}
        </Box>
    );

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{ boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 2 }}
        >
            <Container>
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', pl: 0 }}>
                        <Button href="/" sx={{ mx: 1, maxWidth: 60 }}>
                            <Sitemark />
                        </Button>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
                            {menuItems.map((item: MenuItemType, index: number) => (
                                <Button
                                    key={index}
                                    variant="text"
                                    color="info"
                                    href={item.url}
                                    sx={{ minWidth: 0, color: '#00ff00' }}
                                >
                                    {item.title}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <IconButton aria-label="Menu button" onClick={handleDrawerToggle} sx={{ color: '#00ff00' }}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </StyledToolbar>
            </Container>
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { bgcolor: '#000000' } }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
};

export default AppAppBar;