
// Catalyst UI components
import type { ReactNode } from "react";
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

function TeamDropdownMenu() {
  return (
    <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
      <DropdownItem href="/teams/1/settings">
        <Cog8ToothIcon />
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/teams/1">
        <Avatar slot="icon" src="/tailwind-logo.svg" />
        <DropdownLabel>Tailwind Labs</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/teams/2">
        <Avatar slot="icon" initials="WC" className="bg-purple-500 text-white" />
        <DropdownLabel>Workcation</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/teams/create">
        <PlusIcon />
        <DropdownLabel>New team&hellip;</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

export default function AppLayout({ children, isAuthenticated }: AppLayoutProps) {
  const { signOutUser } = useAuthStore();

  const handleSignOut = async () => {
    await signOutUser();
    // Navigation should be handled by the auth state change and root.tsx redirection logic
  };

  const currentNavItems = isAuthenticated
    ? navItemsAuthenticated
    : navItemsNonAuthenticated;

  return (
    <StackedLayout
      navbar={
        <Navbar>
          {isAuthenticated && (
            <>
              <Dropdown>
                <DropdownButton as={NavbarItem} className="max-lg:hidden">
                  <Avatar src="/tailwind-logo.svg" />
                  <NavbarLabel>Tailwind Labs</NavbarLabel>
                  <ChevronDownIcon />
                </DropdownButton>
                <TeamDropdownMenu />
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
              <NavbarItem href="/search" aria-label="Search">
                <MagnifyingGlassIcon />
              </NavbarItem>
              <NavbarItem href="/inbox" aria-label="Inbox">
                <InboxIcon />
              </NavbarItem>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src="/profile-photo.jpg" square />
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
                  <Avatar src="/tailwind-logo.svg" />
                  <SidebarLabel>Tailwind Labs</SidebarLabel>
                  <ChevronDownIcon />
                </DropdownButton>
                <TeamDropdownMenu />
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
