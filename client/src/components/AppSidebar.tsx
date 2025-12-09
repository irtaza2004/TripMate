import { Home, Plane, Receipt, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Trip } from '@/lib/types';

interface AppSidebarProps {
  trips: Trip[];
  currentUser?: { name: string; email: string };
}

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'My Trips', url: '/trips', icon: Plane },
  { title: 'All Expenses', url: '/expenses', icon: Receipt },
];

export function AppSidebar({ trips, currentUser }: AppSidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Tripmate</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {trips.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Trips</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {trips.slice(0, 5).map((trip) => (
                  <SidebarMenuItem key={trip.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === `/trips/${trip.id}`}
                      data-testid={`nav-trip-${trip.id}`}
                    >
                      <Link href={`/trips/${trip.id}`}>
                        <span className="truncate">{trip.name}</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="nav-settings">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {currentUser && (
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
            <SidebarMenuButton asChild className="h-8 w-8 p-0" data-testid="button-logout">
              <button onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </button>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
