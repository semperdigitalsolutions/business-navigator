
// Catalyst UI components
import type { ReactNode } from "react";
import type { User } from '@supabase/supabase-js';
import { Avatar } from "../ui-kit/catalyst/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../ui-kit/catalyst/dropdown";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "../ui-kit/catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "../ui-kit/catalyst/sidebar";
import { StackedLayout } from "../ui-kit/catalyst/stacked-layout";

import { useAuthStore } from '~/stores/authStore';
import { useBusinessStore } from '~/hooks/layouts/applayout/useBusiness';
// Heroicons
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import { InboxIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Footer from "~/components/ui/Footer"; // Use the custom footer component

interface AppLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean; // Added isAuthenticated prop
}

// Define different navigation items based on authentication state
const navItemsNonAuthenticated = [
  { label: "Home", url: "/" },
  { label: "Login", url: "/login" },
  { label: "Sign Up", url: "/signup" },
];

const navItemsAuthenticated = [
  { label: "Home", url: "/home" },
  { label: "2nd Page", url: "/2ndPage" },
];

const sidebarNavItems = [
  { label: "2nd Page", url: "/2ndPage" },
  { label: "Legal Registration", url: "/legal-registration" },
];

function BusinessDropdownMenu() {
  const { businesses, isSubscribed } = useBusinessStore();
  return (
    <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
      {businesses.map((business) => (
        <DropdownItem key={business.id} href={`/business/${business.id}`}>
          <DropdownLabel>{business.name}</DropdownLabel>
        </DropdownItem>
      ))}
      <DropdownDivider />
      {isSubscribed ? (
        <DropdownItem href="/new-business">
          <PlusIcon />
          <DropdownLabel>New business</DropdownLabel>
        </DropdownItem>
      ) : (
        <DropdownItem href="/subscribe">
          <PlusIcon />
          <DropdownLabel>Subscribe to add more businesses</DropdownLabel>
        </DropdownItem>
      )}
    </DropdownMenu>
  );
}

export default function AppLayout({ children, isAuthenticated }: AppLayoutProps) {
  const { signOutUser, user } = useAuthStore();
  const { currentBusiness } = useBusinessStore();

  const handleSignOut = async () => {
    await signOutUser();
    // Navigation should be handled by the auth state change and root.tsx redirection logic
  };

  const currentNavItems = isAuthenticated
    ? navItemsAuthenticated
    : navItemsNonAuthenticated;

  const getUserInitials = (user: User | null): string => {
    if (!user) return '';
    const name = user.user_metadata?.name || user.email;
    if (!name) return '';
    if (name.includes(' ')) {
      return name.split(' ').map((part: string) => part[0]).join('').toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <StackedLayout
      navbar={
        <Navbar>
          {isAuthenticated && (
            <>
              <Dropdown>
                <DropdownButton as={NavbarItem} className="max-lg:hidden">
                  {currentBusiness ? (
                    <>
                      <NavbarLabel>{currentBusiness.name}</NavbarLabel>
                      <ChevronDownIcon />
                    </>
                  ) : (
                    <div className="h-6 w-40 animate-pulse rounded-lg bg-zinc-950/5 dark:bg-white/5" />
                  )}
                </DropdownButton>
                <BusinessDropdownMenu />
              </Dropdown>
              <NavbarDivider className="max-lg:hidden" />
            </>
          )}
          <NavbarSection className="max-lg:hidden">
            {currentNavItems.map(({ label, url }) => (
              <NavbarItem key={label} href={url}>
                {label}
              </NavbarItem>
            ))}
          </NavbarSection>
          <NavbarSpacer />
          {isAuthenticated && (
            <NavbarSection>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src={user?.user_metadata?.avatar_url} initials={getUserInitials(user)} square />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="bottom end">
                  <DropdownItem href="/my-profile">
                    <UserIcon />
                    <DropdownLabel>My profile</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/settings">
                    <Cog8ToothIcon />
                    <DropdownLabel>Settings</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy">
                    <ShieldCheckIcon />
                    <DropdownLabel>Privacy policy</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/share-feedback">
                    <LightBulbIcon />
                    <DropdownLabel>Share feedback</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleSignOut}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarSection>
          )}
        </Navbar>
      }
      sidebar={
        isAuthenticated ? (
          <Sidebar>
            <SidebarHeader>
              <Dropdown>
                <DropdownButton as={SidebarItem} className="lg:mb-2.5">
                  {currentBusiness ? (
                    <>
                      <SidebarLabel>{currentBusiness.name}</SidebarLabel>
                      <ChevronDownIcon />
                    </>
                  ) : (
                    // Placeholder for loading state
                    <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-950/5 dark:bg-white/5" />
                  )}
                </DropdownButton>
                <BusinessDropdownMenu />
              </Dropdown>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                {sidebarNavItems.map(({ label, url }) => (
                  <SidebarItem key={label} href={url}>
                    {label}
                  </SidebarItem>
                ))}
              </SidebarSection>
            </SidebarBody>
          </Sidebar>
        ) : null
      }
      footer={<Footer />}
    >
      {children}
    </StackedLayout>
  );
}
