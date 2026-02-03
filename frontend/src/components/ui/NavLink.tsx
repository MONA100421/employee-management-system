import { forwardRef } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          [
            className,
            isActive ? activeClassName : null,
            isPending ? pendingClassName : null,
          ]
            .filter(Boolean)
            .join(" ")
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
