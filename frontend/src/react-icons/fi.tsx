"use client";

import { forwardRef } from "react";
import type { SVGProps, ReactNode } from "react";
import { motion } from "motion/react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
  disableHover?: boolean;
};

type ShellProps = IconProps & {
  children: ReactNode;
  viewBox?: string;
};

function getCommonProps({ size = 24, color = "currentColor", strokeWidth = 2, className = "", disableHover = false, viewBox = "0 0 24 24", children, ...rest }: ShellProps) {
  return {
    width: size,
    height: size,
    viewBox,
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...rest,
    children,
    whileHover: disableHover ? undefined : { scale: 1.06, y: -1 },
    transition: { type: "spring", stiffness: 320, damping: 18 },
  };
}

function createIcon(displayName: string, render: (props: IconProps) => ReactNode, viewBox = "0 0 24 24") {
  const Component = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <motion.svg ref={ref} {...getCommonProps({ ...props, viewBox, children: render(props) })} />
  ));
  Component.displayName = displayName;
  return Component;
}

const FiHome = createIcon("FiHome", () => (
  <>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10.75V20h14v-9.25" />
    <path d="M9 20v-6h6v6" />
  </>
));

const FiSearch = createIcon("FiSearch", () => (
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </>
));

const FiBell = createIcon("FiBell", () => (
  <>
    <path d="M15 17H9" />
    <path d="M18 17H6l1.2-2V11a4.8 4.8 0 0 1 9.6 0v4l1.2 2Z" />
  </>
));

const FiUser = createIcon("FiUser", () => (
  <>
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
  </>
));

const FiChevronDown = createIcon("FiChevronDown", () => <path d="m6 9 6 6 6-6" />);
const FiChevronLeft = createIcon("FiChevronLeft", () => <path d="m15 6-6 6 6 6" />);
const FiChevronRight = createIcon("FiChevronRight", () => <path d="m9 6 6 6-6 6" />);
const FiChevronsLeft = createIcon("FiChevronsLeft", () => (
  <>
    <path d="m13 6-6 6 6 6" />
    <path d="m19 6-6 6 6 6" />
  </>
));
const FiChevronsRight = createIcon("FiChevronsRight", () => (
  <>
    <path d="m5 6 6 6-6 6" />
    <path d="m11 6 6 6-6 6" />
  </>
));

const FiMenu = createIcon("FiMenu", () => (
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
));

const FiX = createIcon("FiX", () => <path d="m6 6 12 12M18 6 6 18" />);

const FiLoader = createIcon("FiLoader", () => (
  <>
    <path d="M12 3a9 9 0 1 0 9 9" />
    <path d="M21 3v6h-6" />
  </>
));

const FiBox = createIcon("FiBox", () => (
  <>
    <path d="m12 3 8 4-8 4-8-4 8-4Z" />
    <path d="M4 7v10l8 4 8-4V7" />
    <path d="M12 11v10" />
  </>
));

const FiPackage = createIcon("FiPackage", () => (
  <>
    <path d="m4 7 8-4 8 4-8 4-8-4Z" />
    <path d="M4 7v10l8 4 8-4V7" />
    <path d="M12 11v10" />
  </>
));

const FiUsers = createIcon("FiUsers", () => (
  <>
    <circle cx="9" cy="8" r="2.5" />
    <circle cx="16.5" cy="9.5" r="2" />
    <path d="M4.5 19a4.5 4.5 0 0 1 9 0" />
    <path d="M13.5 19a3.8 3.8 0 0 1 7.5 0" />
  </>
));

const FiMapPin = createIcon("FiMapPin", () => (
  <>
    <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
    <circle cx="12" cy="10" r="2" />
  </>
));

const FiShield = createIcon("FiShield", () => <path d="M12 3 5 6v5c0 4.8 3.2 8.8 7 10 3.8-1.2 7-5.2 7-10V6l-7-3Z" />);
const FiKey = createIcon("FiKey", () => (
  <>
    <circle cx="8" cy="12" r="3" />
    <path d="M11 12h10" />
    <path d="M18 12v2" />
    <path d="M20 12v1.5" />
  </>
));

const FiLayers = createIcon("FiLayers", () => (
  <>
    <path d="m12 4 8 4-8 4-8-4 8-4Z" />
    <path d="m4 12 8 4 8-4" />
    <path d="m4 16 8 4 8-4" />
  </>
));

const FiSliders = createIcon("FiSliders", () => (
  <>
    <path d="M6 4v16" />
    <circle cx="6" cy="8" r="2" />
    <path d="M12 4v16" />
    <circle cx="12" cy="14" r="2" />
    <path d="M18 4v16" />
    <circle cx="18" cy="10" r="2" />
  </>
));

const FiTag = createIcon("FiTag", () => (
  <>
    <path d="M4 7a2 2 0 0 1 2-2h6l8 8-6 6-8-8V7Z" />
    <circle cx="8.5" cy="8.5" r="1" />
  </>
));

const FiTruck = createIcon("FiTruck", () => (
  <>
    <path d="M3 7h10v9H3z" />
    <path d="M13 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </>
));

const FiArrowDownCircle = createIcon("FiArrowDownCircle", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v8" />
    <path d="m8.5 11.5 3.5 3.5 3.5-3.5" />
  </>
));

const FiArrowUpCircle = createIcon("FiArrowUpCircle", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 17V9" />
    <path d="m8.5 12.5 3.5-3.5 3.5 3.5" />
  </>
));

const FiClipboard = createIcon("FiClipboard", () => (
  <>
    <rect x="7" y="5" width="10" height="15" rx="2" />
    <path d="M9 5a3 3 0 0 1 6 0" />
    <path d="M9 10h6" />
    <path d="M9 14h6" />
  </>
));

const FiBarChart2 = createIcon("FiBarChart2", () => (
  <>
    <path d="M5 19V9" />
    <path d="M11 19V5" />
    <path d="M17 19v-8" />
    <path d="M4 19h16" />
  </>
));

const FiFileText = createIcon("FiFileText", () => (
  <>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M6 3h8l5 5v13H6z" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </>
));

const FiArrowDown = createIcon("FiArrowDown", () => <path d="M12 5v12" />);
const FiArrowUp = createIcon("FiArrowUp", () => <path d="M12 19V7" />);

const FiInbox = createIcon("FiInbox", () => (
  <>
    <path d="M4 6h16l-2 8H14l-2 3-2-3H6l-2-8Z" />
    <path d="M4 14h4l2 3h4l2-3h4" />
  </>
));

const FiCheckCircle = createIcon("FiCheckCircle", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="m8.5 12 2.5 2.5L16 9.5" />
  </>
));

const FiXCircle = createIcon("FiXCircle", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </>
));

const FiInfo = createIcon("FiInfo", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 10v5" />
    <path d="M12 7h.01" />
  </>
));

const FiAlertTriangle = createIcon("FiAlertTriangle", () => (
  <>
    <path d="m12 5 8 14H4l8-14Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </>
));

const FiLogIn = createIcon("FiLogIn", () => (
  <>
    <path d="M10 7H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4" />
    <path d="m14 8 4 4-4 4" />
    <path d="M18 12H8" />
  </>
));

const FiLogOut = createIcon("FiLogOut", () => (
  <>
    <path d="M10 7H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4" />
    <path d="m14 8 4 4-4 4" />
    <path d="M18 12H8" />
  </>
));

const FiRefreshCw = createIcon("FiRefreshCw", () => (
  <>
    <path d="M20 6v5h-5" />
    <path d="M4 12a8 8 0 0 1 13.5-5.5L20 11" />
    <path d="M4 18v-5h5" />
    <path d="M20 12a8 8 0 0 1-13.5 5.5L4 13" />
  </>
));

const FiActivity = createIcon("FiActivity", () => (
  <>
    <path d="M4 13h4l2-6 4 12 2-6h4" />
  </>
));

const FiEdit2 = createIcon("FiEdit2", () => (
  <>
    <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
    <path d="M14.8 5.2 18 8.4" />
  </>
));

const FiTrash2 = createIcon("FiTrash2", () => (
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M10 11v5M14 11v5" />
  </>
));

const FiPlus = createIcon("FiPlus", () => <path d="M12 5v14M5 12h14" />);

const FiUserPlus = createIcon("FiUserPlus", () => (
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M4 19a5 5 0 0 1 10 0" />
    <path d="M18 8v6M15 11h6" />
  </>
));

const FiLock = createIcon("FiLock", () => (
  <>
    <rect x="6.5" y="10" width="11" height="9" rx="2" />
    <path d="M8 10V8a4 4 0 0 1 8 0v2" />
  </>
));

const FiMoon = createIcon("FiMoon", () => <path d="M14.5 3a8.5 8.5 0 1 0 6.5 13.5A7 7 0 0 1 14.5 3Z" />);
const FiSun = createIcon("FiSun", () => (
  <>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </>
));

const FiArrowDownRight = createIcon("FiArrowDownRight", () => <path d="M8 8h8v8M8 8l8 8" />);
const FiArrowUpRight = createIcon("FiArrowUpRight", () => <path d="M8 16h8V8M8 16l8-8" />);

const FiChevronRight = createIcon("FiChevronRight", () => <path d="m9 6 6 6-6 6" />);

const FiSearchSpinner = createIcon("FiSearchSpinner", () => <circle cx="12" cy="12" r="8" />);

export {
  FiActivity,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowDownCircle,
  FiArrowDownRight,
  FiArrowUp,
  FiArrowUpCircle,
  FiArrowUpRight,
  FiBarChart2,
  FiBell,
  FiBox,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiClipboard,
  FiEdit2,
  FiFileText,
  FiHome,
  FiInbox,
  FiInfo,
  FiKey,
  FiLayers,
  FiLoader,
  FiLock,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiMoon,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSearchSpinner,
  FiShield,
  FiShield as FiShieldCheck,
  FiSliders,
  FiSun,
  FiTag,
  FiTrash2,
  FiTruck,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
  FiXCircle,
  FiChevronRight,
  FiChevronDown,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
};

export type { IconProps };