import { HTMLAttributes } from "react";

type BadgeVariant = "solid" | "outline" | "glow";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const baseClass = "nsc-badge";

const variantMap: Record<BadgeVariant, string> = {
  solid: baseClass,
  outline: `${baseClass} nsc-badge--outline`,
  glow: `${baseClass} nsc-badge--glow`,
};

export const Badge = ({ variant = "solid", className = "", ...rest }: BadgeProps) => {
  const classes = [variantMap[variant], className].filter(Boolean).join(" ");

  return <span className={classes} {...rest} />;
};
