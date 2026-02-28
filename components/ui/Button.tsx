"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "nsc-btn nsc-btn--primary",
  secondary: "nsc-btn nsc-btn--secondary",
  ghost: "nsc-btn nsc-btn--ghost",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className = "", ...rest }, ref) => {
    const classes = [variantClass[variant], fullWidth ? "nsc-btn--full" : "", className]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} className={classes} {...rest} />;
  }
);

Button.displayName = "Button";
