"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

type StaggerChildProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Applies staggered entrance animation to each child without wrapping them.
 * Wrappers break CSS grid/flex layouts (extra grid cells with detached backgrounds).
 */
export function StaggerChildren({
  children,
  className,
  staggerMs = 60,
}: StaggerChildrenProps) {
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, i) => {
        if (!isValidElement(child)) return child;

        const element = child as ReactElement<StaggerChildProps>;
        return cloneElement(element, {
          className: cn("animate-fade-in-up", element.props.className),
          style: {
            ...element.props.style,
            animationDelay: `${i * staggerMs}ms`,
          },
        });
      })}
    </div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <div className={cn("transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]", className)}>
      {children}
    </div>
  );
}
